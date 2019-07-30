import * as auth from '../auth';
import { Request, Response } from 'express';
import * as httpMock from 'node-mocks-http';
import { ApiError } from 'sx-sequelize-api';
import * as event from 'events';

let req: httpMock.MockRequest<Request>;
let res: httpMock.MockResponse<Response>;

beforeEach((): void => {
    req = httpMock.createRequest();
    res = httpMock.createResponse({
        eventEmitter: event.EventEmitter,
    });
});

describe('Test AuthMiddleware', (): void => {
    describe('authMiddleware() Operations', (): void => {
        test('Calls authMiddleware Function with Valid Auth Token', (): void => {
            let credentials = { username: 'testUsername', password: 'testPassword' };
            req.body = { ...credentials };

            auth.authMiddleware();
            auth.setUsernamePassword(credentials);
            auth.authLogin(req, res, null);

            let resJson = res._getJSONData();
            req.headers['x-access-token'] = resJson.token;
            req.body.token = resJson.token;
            auth.authMiddleware()(req, res, (next): void => {
                expect(next).toBe(undefined);
                expect(next).not.toEqual(ApiError.accessError || ApiError.serverError);
            });
        });

        test('Calls authMiddleware Function with Invalid Auth Token', (): void => {
            req.body.token = 'asdfasdf';
            auth.authMiddleware()(req, res, (next): void => {
                expect(next).toEqual(ApiError.accessError());
            });
        });

        test('Calls authMiddleware Function without Auth Token in Body', (): void => {
            auth.authMiddleware()(req, res, (next): void => {
                req.body.token = 'accessToken';
                expect(next).toEqual(ApiError.accessError());
            });
        });
    });

    describe('Test Set & Get Credentials', (): void => {
        test('Calls setUsernamePassword Function', (): void => {
            let credentials = {
                username: 'testUsername',
                password: 'testPassword',
            };

            auth.setUsernamePassword(credentials);
            expect(auth.getUsernamePassword()).toEqual(credentials);
        });

        test('Calls getUsernamePassword Function', (): void => {
            expect(auth.getUsernamePassword()).toEqual({ username: 'testUsername', password: 'testPassword' });
        });
    });

    describe('authLogin() Operations', (): void => {
        test('Calls authLogin Function with Success', (): void => {
            let credentials = { username: 'testUsername', password: 'testPassword' };
            req.body = { ...credentials };

            auth.authMiddleware();
            auth.setUsernamePassword(credentials);
            auth.authLogin(req, res, null);

            let resJson = res._getJSONData();

            expect(resJson.token).not.toBeUndefined();
            expect(typeof resJson.token).toEqual('string');
        });

        test('Calls authLogin Function Without Credentials', (): void => {
            auth.setUsernamePassword({ username: null, password: null });
            auth.authLogin(req, res, (next): void => {
                expect(next).toEqual(ApiError.accessError());
            });
        });

        test('Calls authLogin Function With Invalid Credentials', (): void => {
            let credentials = { username: 'testUsername', password: 'testPassword' };

            req.body.username = 'testUsername';
            req.body.password = 'exPassword';

            auth.setUsernamePassword(credentials);
            auth.authLogin(req, res, (next): void => {
                expect(next).toEqual(ApiError.accessError());
            });
        });

        test('Calls authLogin Function Without body in Request', (): void => {
            let credentials = { username: 'testUsername', password: 'testPassword' };

            auth.setUsernamePassword(credentials);
            auth.authLogin(req, res, (next): void => {
                expect(next).toEqual(ApiError.accessError());
            });
        });
    });

    describe('getAuthHashCode() Function', (): void => {
        test('Should validate the hashCode that returned hash code', (): void => {
            let hashCode = auth.getAuthHashCode();
            expect(typeof hashCode).toBe('string');
            expect(hashCode.length).toBe(64);
        });
    });

    describe('authLogout() Function', (): void => {
        test('Calls authLogout Function', (): void => {
            auth.authLogout(req, res);
            expect(res._getJSONData()).toBe(true);
        });
    });
});
