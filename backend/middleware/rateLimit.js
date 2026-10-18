import rateLimit from 'express-rate-limit';

/**
 * Rate limits for the public authentication endpoints only.
 *
 * The scope is deliberately narrow. Login and register are the two endpoints
 * that can be hammered by an attacker - credential stuffing on login and mass
 * automated account creation on register. Nothing else is throttled: the public
 * read APIs (doctors, healthcare centers, health information), the appointment
 * endpoints and every admin endpoint are left completely untouched so normal
 * browsing and integration testing are never affected.
 *
 * The counters live in memory, which is the right fit for the current single
 * instance college / demo deployment. If the API is ever scaled to more than
 * one process, replace the store here with a shared one such as Redis. That is
 * the only change needed - no other file has to know about it.
 */

/**
 * Tunables for the authentication rate limits.
 *
 * These are deliberately generous so normal use and manual testing are never
 * interrupted. To tune the policy, change the numbers here and restart.
 */
export const AUTH_RATE_LIMIT = {
  /** Login: stops repeated credential attempts against one account. */
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10,
  },
  /** Register: stops mass automated account creation from one source. */
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5,
  },
};

/** Builds a limiter that replies with the same simple JSON shape as the rest of the API. */
const buildLimiter = ({ windowMs, limit }, message) =>
  rateLimit({
    windowMs,
    limit,
    // Return the standard RateLimit headers; drop the legacy X-RateLimit ones.
    standardHeaders: true,
    legacyHeaders: false,
    /**
     * Sends HTTP 429 once the limit is exceeded.
     * The reply deliberately contains nothing but a short message: no email,
     * no password, no token and no request detail is ever echoed back.
     */
    handler: (req, res) => res.status(429).json({ message }),
  });

/** Converts a window in milliseconds to whole minutes for the error message. */
const windowInMinutes = (ms) => Math.max(1, Math.round(ms / 60000));

/** Limits POST /api/auth/login. */
export const loginLimiter = buildLimiter(
  AUTH_RATE_LIMIT.login,
  `Too many login attempts. Please try again in ${windowInMinutes(
    AUTH_RATE_LIMIT.login.windowMs
  )} minutes.`
);

/** Limits POST /api/auth/register. */
export const registerLimiter = buildLimiter(
  AUTH_RATE_LIMIT.register,
  'Too many accounts created from this device. Please try again later.'
);