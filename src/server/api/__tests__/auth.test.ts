import * as auth from '../auth';
import * as httpMock from 'node-mocks-http';
import { ApiError } from 'sx-sequelize-api';

let req;
let res;

beforeEach((): void => {
    req = httpMock.createRequest();
    res = httpMock.createResponse();
});

describe('Test AuthMiddleware', (): void => {
    describe('authMiddleware() Operations', (): void => {
        it('Calls authMiddleware Function with Invalid Auth Token', (done): void => {
            req.body.token = 'testToken';
            auth.authMiddleware()(req, res, (expectedError) => {
                let err: ApiError = ApiError.accessError('Access Denied', 401);
                expect(expectedError).toEqual(err);
                done();
            });
        });

        it('Calls authMiddleware Function without Auth Token in Body', (done): void => {
            auth.authMiddleware()(req, res, (expectedError) => {
                let err: ApiError = ApiError.accessError('Access Denied', 401);
                expect(expectedError).toEqual(err);
                done();
            });
        });
    });

    describe('Test Set Credentials', (): void => {
        it('Calls setUsernamePassword Function', (done): void => {
            let username = 'testUsername';
            let password = 'testPassword';

            auth.setUsernamePassword({ username, password });
            done();
        });
    });

    describe('authLogin() Operations', (): void => {
        it('Calls authLogin Function with Success', (done): void => {
            let credentials = { username: 'testUsername', password: 'testPassword' };

            req.body.username = credentials.username;
            req.body.password = credentials.password;

            auth.setUsernamePassword(credentials);
            auth.authLogin(req, res, next => {
                expect(res.statusCode).toEqual(200);
                expect(res.statusMessage).toEqual('OK');
                expect(next).not.toBe(ApiError.accessError('Access Denied', 401));
                done();
            });
            done();
        });

        it('Calls authLogin Function With Invalid Credentials', (done): void => {
            let credentials = { username: 'testUsername', password: 'testPassword' };

            req.body.username = 'testUsername';
            req.body.password = 'exPassword';

            auth.setUsernamePassword(credentials);
            auth.authLogin(req, res, next => {
                expect(next).toEqual(ApiError.accessError('Access Denied', 401));
                done();
            });
            done();
        });

        it('Calls authLogin Function Without  Credentials', (done): void => {
            auth.authLogin(req, res, next => {
                expect(next).toEqual(ApiError.accessError('Access Denied', 401));
                done();
            });
            done();
        });


        it('Calls authLogin Function Without body in Request', (done): void => {
            let credentials = { username: 'testUsername', password: 'testPassword' };

            auth.setUsernamePassword(credentials);
            auth.authLogin(req, res, next => {
                expect(next).toEqual(ApiError.accessError('Access Denied', 401));
                done();
            });
            done();
        });
    });

    describe('getAuthHashCode() Function', (): void => {
        it('Should validate the hashCode that returned hash code', (done): void => {
            let hashCode = auth.getAuthHashCode();
            expect(typeof hashCode).toBe('string');
            expect(hashCode.length).toBe(64);
            done();
        });
    });

    describe('authLogout() Function', (): void => {
        it('Calls authLogout Function', (done): void => {
            auth.authLogout(req, res);
            done();
        });
    });
})
