import { mocked } from 'ts-jest/utils';
import * as sxApi from 'sx-sequelize-api';
import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import * as request from 'supertest';
import api from '../resource-cpu';

jest.mock('sx-sequelize-api');

const mockedSxApi = mocked(sxApi, false);
const mockedModelApi = mocked(mockedSxApi.ModelRestApi, false);

mockedModelApi.mockImplementation(
    (): sxApi.ModelRestApi => {
        function getAll(): (req: Request, res: Response, next: NextFunction) => void {
            return (req: Request, res: Response, next: NextFunction) => {
                return res.json();
            };
        }
        function count(): (req: Request, res: Response, next: NextFunction) => void {
            return () => {};
        }
        function getById(): (req: Request, res: Response, next: NextFunction) => void {
            return () => {};
        }
        let mock = {
            getAll,
            count,
            getById,
        };

        return (mock as unknown) as sxApi.ModelRestApi;
    },
);

let app = express();
app.use(api(null));

describe('ResourceCPU Endpoints', (): void => {
    test('Endpoint / OK', (done): void => {
        request(app)
            .get('/')
            .then((response): void => {
                expect(response.status).toBe(200);
                done();
            });
    });
});
