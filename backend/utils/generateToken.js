import jwt from 'jsonwebtoken';

/**
 * Creates a signed JWT for the given user id.
 * Only the user id is stored in the token - the role is always re-read
 * from the database so a token can never grant stale privileges.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export default generateToken;
