// test/jwtAuth.test.js
const chai = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { expect } = chai;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
require('dotenv').config();


describe('jwtAuth Middleware', () => {
    let jwtAuth;
    let jwt;
    let logger;
    let req;
    let res;
    let next;

    beforeEach(() => {
        jwt = {
            verify: sinon.stub()
        };

        logger = {
            error: sinon.spy(),
            warn: sinon.spy()
        };

        jwtAuth = proxyquire('../middlewares/jwtAuth', {
            'jsonwebtoken': jwt,
            '../utils/logger': logger
        });

        req = {
            headers: {}
        };

        res = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub()
        };

        next = sinon.spy();
    });

    it('should return 403 if authorization header is missing', () => {
        jwtAuth(req, res, next);

        expect(res.status).to.have.been.calledWith(403);
        expect(res.send).to.have.been.calledWith('Authorization header is required');
        expect(logger.error).to.have.been.calledWith('Authorization header is required');
    });

    it('should return 403 if bearer token is missing', () => {
        req.headers['authorization'] = 'Bearer ';

        jwtAuth(req, res, next);

        expect(res.status).to.have.been.calledWith(403);
        expect(res.send).to.have.been.calledWith('Bearer token is required');
        expect(logger.error).to.have.been.calledWith('Bearer token is required');
    });

    it('should return 403 if token is invalid', () => {
        req.headers['authorization'] = 'Bearer invalidtoken';
        jwt.verify.throws(new Error('Invalid token'));

        jwtAuth(req, res, next);

        expect(res.status).to.have.been.calledWith(403);
        expect(res.send).to.have.been.calledWith('Invalid token');
        expect(logger.error).to.have.been.calledWith('Invalid token');
    });

    it('should return 401 if token has expired', () => {
        req.headers['authorization'] = 'Bearer expiredtoken';
        jwt.verify.throws({ name: 'TokenExpiredError' });

        jwtAuth(req, res, next);

        expect(res.status).to.have.been.calledWith(401);
        expect(res.send).to.have.been.calledWith('Token has expired');
        expect(logger.warn).to.have.been.calledWith('Token has expired');
    });

    it('should call next if token is valid', () => {
        req.headers['authorization'] = 'Bearer validtoken';
        const decoded = { userId: 1 };
        jwt.verify.returns(decoded);

        jwtAuth(req, res, next);

        expect(jwt.verify).to.have.been.calledWith('validtoken', process.env.JWT_SECRET);
        expect(req.user).to.equal(decoded);
        expect(next).to.have.been.called;
    });
});
