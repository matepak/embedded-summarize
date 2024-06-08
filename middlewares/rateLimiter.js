// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).send('Too many requests from this IP, please try again later.');
    }
});

module.exports = limiter;
