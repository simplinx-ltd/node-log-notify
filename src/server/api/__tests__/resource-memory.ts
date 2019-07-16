import { mocked } from 'ts-jest/utils';
import * as sxApi from 'sx-sequelize-api';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as request from 'supertest';
import api from '../resource-memory';
import { authMiddleware } from '../auth';

jest.mock('sx-sequelize-api');
jest.mock('../auth');

const mockedSxApi = mocked(sxApi, false);
const mockedModelApi = mocked(mockedSxApi.ModelRestApi, false);
const mockedAuth = mocked(authMiddleware, false);

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

mockedAuth.mockImplementation((): ((req: Request, res: Response, next: NextFunction) => void) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        return next();
    };
});

let app = express();
app.use(api(null));

describe('ResourceMemory Endpoints', (): void => {
    test('Endpoint / OK', (done): void => {
        request(app)
            .get('/')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });

    test('Endpoint /count OK', (done): void => {
        request(app)
            .get('/count')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });

    test('Endpoint /:id OK', (done): void => {
        request(app)
            .get('/1')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });
});
