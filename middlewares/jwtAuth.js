// middlewares/jwtAuth.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const jwtAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        logger.error('Authorization header is required');
        return res.status(403).send('Authorization header is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        logger.error('Bearer token is required');
        return res.status(403).send('Bearer token is required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            logger.warn('Token has expired');
            return res.status(401).send('Token has expired');
        }
        logger.error('Invalid token');
        return res.status(403).send('Invalid token');
    }
};

module.exports = jwtAuth;
