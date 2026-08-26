const jwt = require('jsonwebtoken');

// Single source of truth for JWT secret across the entire application
const JWT_SECRET = process.env.JWT_SECRET || 'cadetconnect_super_secret_jwt_key_2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
}

/**
 * Centralized optional user extractor. Returns user object or null.
 * All routes must use THIS instead of rolling their own JWT logic.
 */
function getOptionalUser(req, db) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (db) {
        return db.findOne('users', u => u.id === decoded.id);
      }
      return decoded;
    }
  } catch (err) {
    // Token invalid or expired — treat as unauthenticated
  }
  return null;
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized action.' });
    }
    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: `Role '${req.user.role}' is not authorized for this operation.` });
    }
    next();
  };
}

module.exports = { generateToken, verifyToken, getOptionalUser, requireRole, JWT_SECRET };
