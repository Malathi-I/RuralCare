# RuralCare

### A Scalable Rural Healthcare Platform for Rural Communities

RuralCare is a MERN application that helps people in rural areas find doctors,
locate healthcare centers, book appointments and read health information in
their own language - even on a slow or unreliable internet connection.

---

## Problem Statement

People living in rural communities face three connected problems:

1. **Finding healthcare is difficult.** Doctors and health centers are
   scattered across villages, and there is no single place to search for them.
2. **Appointments are hard to manage.** Most clinics still keep registers on
   paper, so booking, tracking and cancelling a visit means travelling or
   making repeated phone calls.
3. **Language and connectivity are real barriers.** Health advice is usually
   published in English, and rural users often lose internet access for hours
   at a time because of weak or expensive connectivity.

## Proposed Solution

RuralCare provides one web platform that solves all three:

- A **public directory** of doctors and healthcare centers with search.
- An **appointment booking system** with strict validation against doctor
  availability, so double bookings cannot happen.
- **Eight Indian languages** so users can read the platform comfortably.
- **Offline support** that keeps public health information readable without a
  connection, while login and booking correctly require internet.
- **Role based access control** so patients, doctors and admins each see only
  what they are allowed to see.

## Features

- Email/password registration and login with JWT sessions.
- Patient dashboard: book appointments, view and cancel them, view history.
- Doctor dashboard: manage weekly availability, see today's and upcoming
  appointments, mark visits complete or cancelled.
- Admin dashboard: platform statistics, user and role management, and CRUD for
  doctors, healthcare centers and health articles.
- Public read-only APIs for doctors, healthcare centers and health information.
- Multilingual interface (English, Tamil, Hindi, Telugu, Kannada, Malayalam,
  Bengali, Marathi) with the choice saved in the browser.
- Service worker based offline caching of public content only.
- Online/offline detection with a clear status banner.

## Technology Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React 19, Vite 8, React Router 7, plain CSS        |
| Backend    | Node.js, Express 5, Mongoose 9, express-validator |
| Database   | MongoDB Atlas (cloud, not local MongoDB)           |
| Auth       | JWT (`jsonwebtoken`), `bcryptjs` password hashing  |
| Other      | CORS, dotenv, axios                                |
| PWA        | Hand-written service worker and web app manifest   |
| Version    | Git and GitHub                                     |

## Architecture

```
React (Vite SPA)
      |
      |  HTTPS / JSON over REST, JWT in the Authorization header
      v
Express REST API  --->  Mongoose  --->  MongoDB Atlas
      |
      +--> auth middleware   (is this token valid?)
      +--> role middleware    (is this user a patient / doctor / admin?)
```

The frontend is a single page application. It never talks to the database
directly; every operation goes through the Express API, which performs
validation and authorization first.

### Project Structure

```
RuralCare/
├── frontend/                  React + Vite client
│   ├── public/                index assets, manifest.json, sw.js, icon.svg
│   └── src/
│       ├── components/        Navbar, Footer, cards, guards, message boxes
│       ├── pages/             Public, patient, doctor and admin screens
│       ├── services/          axios client and one service per API area
│       ├── context/           Auth, Language and Network providers
│       ├── hooks/             online status, doctor appointments
│       ├── utils/             date helpers and constants
│       ├── i18n/              eight translation files plus an index
│       ├── App.jsx            routing and providers
│       ├── main.jsx           entry point and service worker registration
│       └── index.css          all styling, mobile first
├── backend/                   Express API
│   ├── config/db.js           MongoDB Atlas connection
│   ├── controllers/           request handling logic
│   ├── middleware/            auth, validation, error handling
│   ├── models/                Mongoose schemas
│   ├── routes/                route definitions
│   ├── utils/                 JWT signing and schedule helpers
│   ├── .env / .env.example    configuration
│   └── server.js              app setup and startup
├── .gitignore
├── README.md
└── package.json
```
## Database Collections

Five Mongoose models in MongoDB Atlas.

**users**

| Field               | Type   | Notes                                           |
| ------------------- | ------ | ----------------------------------------------- |
| `name`              | String | required, 2-60 characters                        |
| `email`             | String | required, unique, lowercased                    |
| `password`          | String | bcrypt hash, `select: false` so never returned   |
| `role`              | String | `patient` / `doctor` / `admin`, default `patient`|
| `preferredLanguage` | String | one of the 8 supported codes                    |
| `createdAt`         | Date   | added automatically                             |

**doctors**

| Field            | Type     | Notes                                  |
| ---------------- | -------- | -------------------------------------- |
| `user`           | ObjectId | reference to `users`, unique            |
| `name`           | String   | required                                |
| `specialization` | String   | required                                |
| `phone`          | String   | required                                |
| `location`       | String   | required                                |
| `available`      | Boolean  | default `true`                          |
| `availability`   | Array    | `{ day, startTime, endTime }` in `HH:mm` |

**healthcarecenters**

| Field      | Type     | Notes            |
| ---------- | -------- | ---------------- |
| `name`     | String   | required         |
| `location` | String   | required         |
| `address`  | String   | required         |
| `phone`    | String   | required         |
| `services` | [String] | list of services |

**appointments**

| Field             | Type     | Notes                                        |
| ----------------- | -------- | -------------------------------------------- |
| `patient`         | ObjectId | reference to `users`                         |
| `doctor`          | ObjectId | reference to `doctors`                       |
| `appointmentDate` | String   | `YYYY-MM-DD`, never in the past              |
| `appointmentTime` | String   | `HH:mm`, inside the doctor's working hours   |
| `status`          | String   | `scheduled` / `completed` / `cancelled`      |
| `createdAt`       | Date     | added automatically                          |

A **partial unique index** prevents two `scheduled` appointments for the same
doctor, date and time, while still allowing a cancelled slot to be re-booked.

**healthinformations**

| Field       | Type   | Notes                        |
| ----------- | ------ | ---------------------------- |
| `title`     | String | required                     |
| `content`   | String | required                     |
| `category`  | String | required                     |
| `language`  | String | one of the 8 supported codes |
| `createdAt` | Date   | added automatically          |
## API Overview

### Public - read only

| Method | Endpoint                      | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/api/health`                 | health check                    |
| GET    | `/api/doctors`                | list doctors (optional filters) |
| GET    | `/api/doctors/:id`            | single doctor                   |
| GET    | `/api/healthcare-centers`     | list centers                    |
| GET    | `/api/healthcare-centers/:id` | single center                   |
| GET    | `/api/health-information`     | list articles                   |
| GET    | `/api/health-information/:id` | single article                  |

### Authentication

| Method | Endpoint             | Access  | Description                   |
| ------ | -------------------- | ------- | ----------------------------- |
| POST   | `/api/auth/register` | Public  | Create a **patient** account  |
| POST   | `/api/auth/login`    | Public  | Log in, returns a JWT         |
| GET    | `/api/auth/me`       | Private | Current logged in user        |
| PUT    | `/api/auth/profile`  | Private | Update own name and language  |

### Patient and doctor

| Method | Endpoint                       | Access  | Description                   |
| ------ | ------------------------------ | ------- | ----------------------------- |
| POST   | `/api/appointments`            | Patient | Book an appointment           |
| GET    | `/api/appointments/my`         | Patient | Own appointments              |
| GET    | `/api/appointments/doctor`     | Doctor  | Appointments assigned to self |
| PATCH  | `/api/appointments/:id/cancel` | Owner   | Cancel an appointment         |
| PATCH  | `/api/appointments/:id/status` | Doctor  | Mark completed or cancelled   |
| GET    | `/api/doctors/me`              | Doctor  | Own doctor profile            |
| PUT    | `/api/doctors/me/availability` | Doctor  | Update own availability       |
| GET    | `/api/doctors/me/schedule`     | Doctor  | Working hours for a date      |

### Admin only

| Method | Endpoint                            | Description                     |
| ------ | ----------------------------------- | ------------------------------- |
| GET    | `/api/admin/stats`                  | Dashboard statistics            |
| GET    | `/api/admin/users`                  | List users                      |
| PATCH  | `/api/admin/users/:id/role`         | Change a user's role            |
| DELETE | `/api/admin/users/:id`              | Delete a user                   |
| GET    | `/api/admin/doctors`                | List doctors with accounts      |
| POST   | `/api/admin/doctors`                | Create doctor account + profile |
| PUT    | `/api/admin/doctors/:id`            | Update a doctor                 |
| DELETE | `/api/admin/doctors/:id`            | Delete a doctor and account     |
| GET    | `/api/admin/appointments`           | All appointments overview       |
| POST   | `/api/admin/healthcare-centers`     | Create a center                 |
| PUT    | `/api/admin/healthcare-centers/:id` | Update a center                 |
| DELETE | `/api/admin/healthcare-centers/:id` | Delete a center                 |
| POST   | `/api/admin/health-information`     | Create an article               |
| PUT    | `/api/admin/health-information/:id` | Update an article               |
| DELETE | `/api/admin/health-information/:id` | Delete an article               |

There is **no** public user list endpoint and **no** public create, update or
delete for doctors, centers or articles. Those are admin-only by design.
## Authentication

1. The user registers or logs in with email and password.
2. The backend finds the user and compares the submitted password against the
   stored **bcrypt hash**.
3. On success it signs a JWT containing only the user's `id`.
4. The frontend stores the token and sends it as
   `Authorization: Bearer <token>` on every private request.
5. The `protect` middleware verifies the token and **re-reads the user from the
   database**, so the role always comes from the stored record, never from the
   token or the request body.

### Security measures

- Passwords are hashed with bcrypt (10 salt rounds) in a Mongoose pre-save hook,
  and the field uses `select: false` so it is excluded from queries by default.
- A `toJSON` transform strips `password` and `__v` from every response.
- Registration **always** creates a `patient`; a client sending `role: "admin"`
  has that value ignored, which blocks privilege escalation.
- Only an authenticated admin can change a role, through
  `PATCH /api/admin/users/:id/role`.
- An admin cannot change their own role or delete their own account, so the
  platform can never end up with no admin.
- Role middleware (`requirePatient`, `requireDoctor`, `requireAdmin`) guards
  every private route.
- Ownership is checked in the controller: a patient only sees and cancels their
  own appointments, and a doctor can only update appointments assigned to them.
- Inputs are validated with `express-validator` before any database work.
- CORS is restricted to the origins listed in `CLIENT_URL`.
- A 404 handler and a global error handler return friendly messages and never
  expose stack traces; the full error is logged server-side for debugging.
- Login failures return the same message whether or not the email exists, which
  prevents account enumeration.

## Appointment validation rules

Enforced on the server in `controllers/appointmentController.js`:

1. The request must be authenticated and the user must be a patient.
2. The patient always books for themselves - a `patient` value in the body is
   ignored.
3. The selected doctor must exist.
4. The doctor must be marked available.
5. The date must not be in the past and the time must be valid `HH:mm`.
6. The time must fall inside the doctor's published working hours.
7. The doctor's slot must not already be taken by a scheduled appointment.
8. The patient must not already have an appointment at that time.
9. Patients can cancel only their own appointments and cannot mark a visit as
   completed.
10. A doctor can only modify appointments assigned to them.
11. Cancelling frees the slot so it can be booked again.

## Roles

| Role     | Can do                                                              |
| -------- | ------------------------------------------------------------------- |
| Patient  | Browse doctors/centers/articles, book, view and cancel own appointments, edit own profile |
| Doctor   | Manage own availability, view own appointments, mark them completed or cancelled |
| Admin    | View statistics, manage users and roles, create/edit/delete doctors, healthcare centers and articles |

Route protection exists in two places:

- **Frontend** - `ProtectedRoute` redirects unauthenticated users to `/login`
  and sends a user with the wrong role to their own dashboard.
- **Backend** - `protect` plus the role middleware. The backend check is the
  real security boundary; hiding a button in the UI is only a convenience.

## Multilingual Support

The interface is available in eight Indian languages:

| Code | Language |
| ---- | -------- |
| `en` | English  |
| `ta` | Tamil    |
| `hi` | Hindi    |
| `te` | Telugu   |
| `kn` | Kannada  |
| `ml` | Malayalam|
| `bn` | Bengali  |
| `mr` | Marathi  |

- One file per language in `src/i18n/`, plus `index.js` which combines them.
- `LanguageContext` exposes `t('key')`, which looks up a dotted key such as
  `nav.doctors` and falls back to English, then to the key itself.
- The chosen language is stored in `localStorage` under `rc_language`, so it
  survives a page refresh.
- The language selector is in the navbar, and registration lets a patient pick
  their preferred language.

## Low-Bandwidth Support

Rural users often pay per megabyte, so the app is built to stay small:

- **Route level code splitting** - every logged-in screen is a separate chunk
  loaded only when needed, so a patient who never books an appointment does not
  download the booking or admin code.
- **A separate vendor chunk** so React and React Router are cached by the
  browser across visits.
- **Client side filtering** on the doctors and centers pages, so typing in the
  search box does not send a request per keystroke.
- **One request per page** - each list screen fetches once and renders.
- **No heavy UI library** - styling is a single hand written CSS file.
- **Optimized static assets** - SVG icon, no large images shipped in the
  bundle.
- **Online/offline detection** - `useOnlineStatus` plus `NetworkContext` show a
  clear banner when the connection drops.

## Offline / PWA Support

- `frontend/public/sw.js` is a service worker registered in production builds.
- It **pre-caches the app shell** (HTML, manifest, icon) so the app opens with
  no connection.
- It uses a **network-first** strategy for the public read endpoints
  (`/api/doctors`, `/api/healthcare-centers`, `/api/health-information`), so a
  user gets fresh data when online and the cached copy when offline.
- **Private data is never cached.** The worker uses an allow-list, and it
  explicitly refuses to cache `/api/auth`, `/api/appointments`, `/api/admin`,
  `/api/doctors/me`, any non-GET request, or any URL containing `token`.
  Login and booking therefore correctly require an internet connection.
- Cache version is bumped through the `VERSION` constant, and old caches are
  deleted on activation.
## Installation

### Prerequisites

- Node.js 20.19 or newer (developed on Node 24)
- A free MongoDB Atlas cluster
- Git

### Steps

```bash
git clone <your-repository-url>
cd RuralCare

# install the root tool, then both apps
npm run install:all
```

Or install each part separately:

```bash
npm install                 # root (concurrently)
npm install --prefix frontend
npm install --prefix backend
```

### Environment variables

Create the two local env files from the examples:

```bash
copy backend\.env.example backend\.env      # Windows
copy frontend\.env.example frontend\.env
```

**`backend/.env`**

| Variable         | Purpose                                        | Example                                        |
| ---------------- | ---------------------------------------------- | ---------------------------------------------- |
| `PORT`           | Port the API listens on                        | `5000`                                          |
| `MONGODB_URI`    | MongoDB Atlas connection string                | `mongodb+srv://user:pass@cluster.mongodb.net/ruralcare` |
| `JWT_SECRET`     | Secret used to sign tokens - **change this**   | a long random string                           |
| `JWT_EXPIRES_IN` | Token lifetime                                 | `7d`                                            |
| `CLIENT_URL`     | Allowed frontend origin(s), comma separated    | `http://localhost:5173`                        |

**`frontend/.env`**

| Variable       | Purpose                             | Example                        |
| -------------- | ----------------------------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the API                 | `http://localhost:5000/api`    |

The real `.env` files are listed in `.gitignore`, so they are never committed.
Only `.env.example` files are tracked.

## MongoDB Atlas Setup

1. Create a free account at <https://www.mongodb.com/atlas> and create a
   cluster (the free M0 tier is enough for a college project).
2. Under **Database Access**, create a database user with a username and a
   generated password.
3. Under **Network Access**, add your own IP address, or allow access from
   anywhere (`0.0.0.0/0`) for local development only.
4. Click **Connect**, choose **Drivers**, and copy the connection string.
5. Paste it into `backend/.env` as `MONGODB_URI` and replace `<password>` with
   the user password you created.
6. Enter your preferred database name in the path, for example
   `.../ruralcare?retryWrites=true&w=majority`.

Connections are indexes: `email` is unique on users, `user` is unique on
doctors, and appointments have a partial unique index on
`(doctor, appointmentDate, appointmentTime)` where the status is `scheduled`.
Mongoose creates these automatically on first run.

### Creating the first admin

The public register route only creates patients, which is the safe default. The
first admin account is created by the seed script that ships with this project -
there is nothing to copy or paste.

1. Create your MongoDB Atlas cluster and copy its connection string (see the
   section above).

2. Open `backend/.env` and set these values:

   | Variable          | What to put                                    |
   | ----------------- | ---------------------------------------------- |
   | `MONGODB_URI`     | your Atlas connection string                    |
   | `JWT_SECRET`      | a long random string                            |
   | `ADMIN_NAME`      | the display name for the admin                  |
   | `ADMIN_EMAIL`     | the email the admin will log in with            |
   | `ADMIN_PASSWORD`  | a real password, at least 8 characters          |

3. Create the admin:

```bash
cd backend
node seed-admin.js
```

The script prints `Admin created successfully: <email>` on success. Two safety
behaviours are built in: it refuses to run while `ADMIN_PASSWORD` is still the
example placeholder, and if the email already exists it leaves that account
untouched and exits successfully.

The password is hashed by the existing `User` model bcrypt hook, so the plain
text value is never written to the database. The script reads every value from
the environment - no credential is hard-coded in the source.

4. Start the application:

```bash
cd ..
npm run dev
```

Then log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set, and use
**Admin Dashboard → Doctors** to create doctor accounts with their weekly
availability.

## Running the Application

Two terminals:

```bash
# terminal 1 - API on http://localhost:5000
npm run dev:backend

# terminal 2 - client on http://localhost:5173
npm run dev:frontend
```

Or start both at once from the project root:

```bash
npm run dev
```

Open <http://localhost:5173>.

Production build:

```bash
npm run build   # builds the frontend into frontend/dist
npm start       # runs the backend with node
```

In development the Vite dev server proxies `/api` calls to
`http://localhost:5000`, so the browser stays on one origin and CORS never
interferes. In production set `VITE_API_URL` to the real deployed API URL.

## GitHub Workflow

`.gitignore` already excludes `node_modules/`, `dist/`, `coverage/`, logs and
every `.env` file, while keeping `.env.example` files tracked so contributors
know which variables to set.

```bash
git init
git add .
git status            # confirm no .env file is staged
git commit -m "Initial commit: RuralCare MERN platform"
git branch -M main
git remote add origin https://github.com/<user>/RuralCare.git
git push -u origin main
```

To deploy, remember that `backend/.env` stays on the server and must be created
there from the example file.

## Future Enhancements

- Email or SMS notifications for appointment confirmations and reminders.
- A telemedicine option for remote consultations.
- Prescription and medical record uploads.
- Availability for more than one healthcare center per doctor.
- Telemedicine-style video consultations using WebRTC.
- Geolocation-based search for the nearest doctor or center.
- More languages, and an admin interface for editing translations.
- Unit and integration tests, plus refresh tokens for longer sessions.
- Audit logging of administrative actions.