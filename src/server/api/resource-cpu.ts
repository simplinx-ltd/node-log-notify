import * as express from 'express';
import { ModelRestApi } from './api.rest';
import { authMiddleware } from './auth';
import Model from '../db/models/resource-cpu';
import { Sequelize } from 'sequelize-typescript';

export default function api(connection: Sequelize): express.Router {
	let router: express.Router = express.Router();
	let DbModel = Model;
	let modelApi = new ModelRestApi(DbModel, connection);

	router.use(authMiddleware());

	router.get('/', modelApi.getAll());
	router.get('/count', modelApi.count());
	router.get('/:id', modelApi.getById());

	return router;
}
