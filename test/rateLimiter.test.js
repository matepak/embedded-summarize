// test/rateLimiter.test.js
const express = require('express');
const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const fs = require('fs');
const path = require('path');

describe('Rate Limiter Middleware', function () {
    let app;
    let logger;
    const logPath = path.resolve(__dirname, '../logs/warn.log');

    beforeEach(() => {
        logger = {
            warn: sinon.spy()
        };

        const rateLimiter = proxyquire('../middlewares/rateLimiter', {
            '../utils/logger': logger
        });

        app = express();
        app.use(rateLimiter);

        app.get('/', (req, res) => {
            res.status(200).send('Hello, world!');
        });

        // Clear log file content before each test
        if (fs.existsSync(logPath)) {
            fs.writeFileSync(logPath, '');
        }
    });

    it('should allow up to 100 requests per 15 minutes', async function () {
        for (let i = 0; i < 100; i++) {
            const res = await request(app).get('/');
            expect(res.status).to.equal(200);
        }
    });

    it('should block requests after exceeding the limit and log the warning', async function () {
        for (let i = 0; i < 100; i++) {
            await request(app).get('/');
        }

        const res = await request(app).get('/');
        expect(res.status).to.equal(429);
        expect(res.text).to.equal('Too many requests from this IP, please try again later.');
        expect(logger.warn).to.have.been.calledWithMatch(/Rate limit exceeded for IP/);
    });
});
