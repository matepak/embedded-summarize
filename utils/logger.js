// utils/logger.js
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const logDirectory = path.resolve(__dirname, '../logs');

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const logger = createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    },
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(logDirectory, 'warn.log'), level: 'warn' }),
        new transports.File({ filename: path.join(logDirectory, 'combined.log') }),
    ],
});

module.exports = logger;
