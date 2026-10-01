import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { NetworkProvider } from './context/NetworkContext.jsx';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Doctors from './pages/Doctors.jsx';
import HealthcareCenters from './pages/HealthcareCenters.jsx';
import HealthInformation from './pages/HealthInformation.jsx';
import NotFound from './pages/NotFound.jsx';

// Logged in screens are loaded on demand so the first download stays small.
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard.jsx'));
const Profile = lazy(() => import('./pages/patient/Profile.jsx'));
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment.jsx'));
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments.jsx'));
const AppointmentHistory = lazy(() => import('./pages/patient/AppointmentHistory.jsx'));

const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard.jsx'));
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile.jsx'));
const Availability = lazy(() => import('./pages/doctor/Availability.jsx'));
const TodaysAppointments = lazy(() => import('./pages/doctor/TodaysAppointments.jsx'));
const UpcomingAppointments = lazy(
  () => import('./pages/doctor/UpcomingAppointments.jsx')
);
const AppointmentManagement = lazy(
  () => import('./pages/doctor/AppointmentManagement.jsx')
);

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement.jsx'));
const DoctorManagement = lazy(() => import('./pages/admin/DoctorManagement.jsx'));
const CenterManagement = lazy(() => import('./pages/admin/CenterManagement.jsx'));
const InfoManagement = lazy(() => import('./pages/admin/InfoManagement.jsx'));
const AppointmentOverview = lazy(
  () => import('./pages/admin/AppointmentOverview.jsx')
);

/** Wraps a page that needs a login and a specific role. */
const guarded = (role, element) => (
  <ProtectedRoute role={role}>{element}</ProtectedRoute>
);

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <NetworkProvider>
          <AuthProvider>
            <div className="app-shell">
              <Navbar />
              <OfflineBanner />

              <main className="app-main">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Public pages */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route
                      path="/healthcare-centers"
                      element={<HealthcareCenters />}
                    />
                    <Route
                      path="/health-information"
                      element={<HealthInformation />}
                    />

                    {/* Patient area */}
                    <Route path="/patient" element={guarded('patient', <PatientDashboard />)} />
                    <Route path="/patient/profile" element={guarded('patient', <Profile />)} />
                    <Route
                      path="/patient/book-appointment"
                      element={guarded('patient', <BookAppointment />)}
                    />
                    <Route
                      path="/patient/appointments"
                      element={guarded('patient', <MyAppointments />)}
                    />
                    <Route
                      path="/patient/history"
                      element={guarded('patient', <AppointmentHistory />)}
                    />
                    {/* Patient shortcuts reuse the public browse pages */}
                    <Route path="/patient/find-doctor" element={guarded('patient', <Doctors />)} />
                    <Route
                      path="/patient/find-center"
                      element={guarded('patient', <HealthcareCenters />)}
                    />
                    <Route
                      path="/patient/health-information"
                      element={guarded('patient', <HealthInformation />)}
                    />
{/* Doctor area */}
                    <Route path="/doctor" element={guarded('doctor', <DoctorDashboard />)} />
                    <Route path="/doctor/profile" element={guarded('doctor', <DoctorProfile />)} />
                    <Route
                      path="/doctor/availability"
                      element={guarded('doctor', <Availability />)}
                    />
                    <Route path="/doctor/today" element={guarded('doctor', <TodaysAppointments />)} />
                    <Route
                      path="/doctor/upcoming"
                      element={guarded('doctor', <UpcomingAppointments />)}
                    />
                    <Route
                      path="/doctor/appointments"
                      element={guarded('doctor', <AppointmentManagement />)}
                    />

                    {/* Admin area */}
                    <Route path="/admin" element={guarded('admin', <AdminDashboard />)} />
                    <Route path="/admin/users" element={guarded('admin', <UserManagement />)} />
                    <Route
                      path="/admin/doctors"
                      element={guarded('admin', <DoctorManagement />)}
                    />
                    <Route
                      path="/admin/centers"
                      element={guarded('admin', <CenterManagement />)}
                    />
                    <Route
                      path="/admin/health-information"
                      element={guarded('admin', <InfoManagement />)}
                    />
                    <Route
                      path="/admin/appointments"
                      element={guarded('admin', <AppointmentOverview />)}
                    />

                    {/* Role shortcuts and catch-all */}
                    <Route path="/patient-dashboard" element={<Navigate to="/patient" replace />} />
                    <Route path="/doctor-dashboard" element={<Navigate to="/doctor" replace />} />
                    <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
            </div>
          </AuthProvider>
        </NetworkProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}