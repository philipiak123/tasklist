const jwt= require('../config/jwt'); 

const authMiddleware = (req, reply, done) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return reply.status(401).send({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verifyToken(token);
    req.user = decoded;
    done();
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
