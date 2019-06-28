/**
 * err format;
 * {
 *      message:'Err message',
 *      name ' 'ERROR_CODE,
 *      ...
 * }
 */

/**
 *  Request Query format

 {
   where:{},
   order:[],
   offset:10,
   limit: 10,
   attributes:[],
   include:[]

 }

 */

import { Request, Response, NextFunction } from 'express';
import { Model, FindOptions, Includeable } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import * as Debug from 'debug';
import { WhereOptions } from 'sequelize';
const debug = Debug('api.rest');

export class ExModel extends Model {}

interface IncludeArray {
    model: string;
    as: string;
    attributes: string[];
    where: WhereOptions;
    include: IncludeArray[];
}

export class ModelRestApi {
    private model: typeof ExModel = null;
    private sequelizeModelList: {
        [key: string]: typeof Model;
    } = null;

    public constructor(model: typeof ExModel, connection: Sequelize) {
        this.model = model;
        this.sequelizeModelList = connection.models;
    }

    public getById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response): void => {
            debug(`getById() with params:${JSON.stringify(req.params)} query:${JSON.stringify(req.query || {})}`);
            this.model
                .findByPk(req.params.id, req.query || {})
                .then(
                    (result): Response => {
                        debug(`getById() result:${JSON.stringify(result)}`);
                        return res.json(result);
                    },
                )
                .catch(
                    (err: Error): Response => {
                        debug(`getById() error. Err:${JSON.stringify(err.stack)}`);
                        return res.status(400).send({ name: err.name, message: err.message });
                    },
                );
        };
    }

    public getAll(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response): Response => {
            debug(`getAll() with query:${JSON.stringify(req.query || {})}`);
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            let includeFnResult = this.formatIncludeStr(
                req.query && req.query.include ? JSON.parse(req.query.include) : [],
            );

            if (includeFnResult.error) {
                debug('getAll() include format error.');
                return res.status(400).send({ name: 'WRONG_FORMAT', message: 'Include Format Error' });
            }

            let filter: FindOptions = {
                where: where,
                offset: req.query.offset && !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0,
                limit: req.query.limit && !isNaN(req.query.limit) ? parseInt(req.query.limit) : 1000 * 1000 * 1000,
                order: req.query.order ? JSON.parse(req.query.order) : [],
                include: includeFnResult.formattedInclude,
            };

            if (req.query.attributes) filter.attributes = JSON.parse(req.query.attributes);

            debug(`getAll() calling findAll() with filter: ${JSON.stringify(filter)}`);
            this.model
                .findAll(filter)
                .then(
                    (result: ExModel[]): Response => {
                        debug(`getAll() calling findAll() returned ${result.length} items`);
                        return res.json(result);
                    },
                )
                .catch(
                    (err: Error): Response => {
                        debug(`getAll() calling findAll() error. Err:${JSON.stringify(err.stack)}`);
                        return res.status(400).send({ name: err.name, message: err.message });
                    },
                );
        };
    }

    public count(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response): void => {
            debug(`count() with query:${JSON.stringify(req.query || {})}`);
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            let filter: FindOptions = {
                where: where,
                include: this.formatIncludeStr(req.query && req.query.include ? JSON.parse(req.query.include) : [])
                    .formattedInclude,
            };

            this.model
                .count(filter)
                .then(
                    (result: number): Response => {
                        debug(`count() result:${JSON.stringify(result)}`);
                        return res.json(result);
                    },
                )
                .catch(
                    (err: Error): Response => {
                        debug(`count() error. Err:${JSON.stringify(err.stack)}`);
                        return res.status(400).send({ name: err.name, message: err.message });
                    },
                );
        };
    }

    public create(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response): void => {
            debug(`create() with body:${JSON.stringify(req.body || {})}`);
            this.model
                .create(req.body)
                .then(
                    (result): Response => {
                        debug(`create() result:${JSON.stringify(result)}`);
                        return res.json(result.get());
                    },
                )
                .catch(
                    (err: Error): Response => {
                        debug(`create() error. Err:${JSON.stringify(err.stack)}`);
                        return res.status(400).send({ name: err.name, message: err.message });
                    },
                );
        };
    }

    public updateById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response): void => {
            debug(`updateById() with params:${JSON.stringify(req.params)} body:${JSON.stringify(req.body || {})}`);
            this.model
                .findByPk(req.params.id)
                .then(
                    (record): Response => {
                        if (!record) {
                            debug(`updateById() Could not find record.`);
                            return res.send({ name: 'error', message: 'Record not found!' });
                        }

                        record
                            .update(req.body)
                            .then(
                                (result): Response => {
                                    debug(`updateById() result:${JSON.stringify(result)}`);
                                    return res.json(result.get());
                                },
                            )
                            .catch(
                                (err: Error): Response => {
                                    debug(`updateById()  updateAttributes error. Err:${JSON.stringify(err.stack)}`);
                                    return res.status(400).send({ name: err.name, message: err.message });
                                },
                            );
                    },
                )
                .catch(
                    (err: Error): Response => {
                        debug(`updateById() findById error. Err:${JSON.stringify(err.stack)}`);
                        return res.status(400).send({ name: err.name, message: err.message });
                    },
                );
        };
    }

    public deleteById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response): void => {
            debug('deleteById() with params:${JSON.stringify(req.params)}');
            this.model
                .destroy({ where: { id: req.params.id } })
                .then(
                    (result: number): Response => {
                        debug(`deleteById() result:${JSON.stringify(result)}`);
                        return res.json(result);
                    },
                )
                .catch(
                    (err: Error): Response => {
                        debug(`deleteById() error. Err:${JSON.stringify(err.stack)}`);
                        return res.status(400).send({ name: err.name, message: err.message });
                    },
                );
        };
    }

    private formatIncludeStr(includeArray: IncludeArray[]): { formattedInclude: Includeable[]; error: boolean } {
        if (!Array.isArray(includeArray)) {
            debug(`formatIncludeStr() Format error. Expecting array. includeStr:${JSON.stringify(includeArray)}`);
            return { formattedInclude: null, error: true };
        }

        let include = [];
        for (let i = 0; i < includeArray.length; i++) {
            debug(`formatIncludeStr() formatting include item. includeStr[i]:${JSON.stringify(includeArray[i])}`);
            let includeItem: Includeable = {
                model: this.sequelizeModelList[includeArray[i].model],
                as: includeArray[i].as ? includeArray[i].as : includeArray[i].model,
                attributes: includeArray[i].attributes ? includeArray[i].attributes : undefined,
                where: includeArray[i].where ? includeArray[i].where : undefined,
            };

            if (!includeArray[i].attributes) delete includeItem.attributes;

            if (includeArray[i].include) {
                let result = this.formatIncludeStr(includeArray[i].include);
                if (result.error) return { formattedInclude: null, error: true };
                includeItem.include = result.formattedInclude;
            }
            debug(`formatIncludeStr() formatted include item. includeItem:${JSON.stringify(includeItem)}`);
            include.push(includeItem);
        }
        return { formattedInclude: include, error: false };
    }
}
