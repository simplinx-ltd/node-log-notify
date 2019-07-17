import { mocked } from 'ts-jest/utils';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as request from 'supertest';

import * as sxApi from 'sx-sequelize-api';
import api from '../index';
import * as auth from '../auth';
import { Config } from '../../config/config-type';

jest.mock('sx-sequelize-api');
jest.mock('../auth');

const mockedSxApi = mocked(sxApi, false);
const mockedModelApi = mocked(mockedSxApi.ModelRestApi, false);
const mockedAuth = mocked(auth, false);

mockedAuth.authLogin.mockImplementation(
    (req: Request, res: Response): Response => {
        return res.json(true);
    },
);

mockedAuth.authLogout.mockImplementation((req: Request, res: Response): void => {
    res.json(true);
});

mockedAuth.authMiddleware.mockImplementation((): ((req: Request, res: Response, next: NextFunction) => void) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        return next();
    };
});

mockedModelApi.mockImplementation(
    (): sxApi.ModelRestApi => {
        function getAll(): (req: Request, res: Response, next: NextFunction) => void {
            return (req: Request, res: Response): Response => {
                return res.json();
            };
        }
        function count(): (req: Request, res: Response, next: NextFunction) => void {
            return (req: Request, res: Response): Response => {
                return res.json();
            };
        }
        function getById(): (req: Request, res: Response, next: NextFunction) => void {
            return (req: Request, res: Response): Response => {
                return res.json();
            };
        }
        let mock = {
            getAll,
            count,
            getById,
        };

        return (mock as unknown) as sxApi.ModelRestApi;
    },
);

let configData: Config = {
    webOptions: {
        username: 'testUsername',
        password: 'testPassword',
        port: null,
    },
    sendMailOptions: null,
    processList: null,
    db: null,
};

let app = express();
api(configData, app, null);

describe('API Endpoints', (): void => {
    test('/auth/login OK', (done): void => {
        request(app)
            .post('/api/auth/login/')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });

    test('/auth/logout OK', (done): void => {
        request(app)
            .post('/api/auth/logout')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });

    test('/resource-memory / OK', (done): void => {
        request(app)
            .get('/api/resource-memory')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });

    test('/resource-cpu / OK', (done): void => {
        request(app)
            .get('/api/resource-cpu')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });

    test('/notification / OK', (done): void => {
        request(app)
            .get('/api/notification')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });
});
