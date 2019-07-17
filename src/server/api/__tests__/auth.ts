import * as auth from '../auth';
import { Request, Response } from 'express';
import * as httpMock from 'node-mocks-http';
import { ApiError } from 'sx-sequelize-api';

let req: Request;
let res: Response;

beforeEach((): void => {
    req = httpMock.createRequest();
    res = httpMock.createResponse();
});

describe('Test AuthMiddleware', (): void => {
    describe('authMiddleware() Operations', (): void => {
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

    describe('authLogin() Operations', (): void => {
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
            const mockedLogout = jest.spyOn(auth, 'authLogout');
            auth.authLogout(req, res);
            expect(mockedLogout).toHaveBeenCalledWith(req, res);
        });
    });
});
