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
import { Model } from 'sequelize';
import { Sequelize } from 'sequelize-typescript'
import * as Debug from 'debug';
const debug = Debug('api.rest');

export class _Model extends Model<any>{ };

export class ModelRestApi {
    private model: typeof _Model = null;
    private sequelizeModelList: Object = null;

    constructor(model: typeof _Model, connection: Sequelize) {
        this.model = model;
        this.sequelizeModelList = connection.models;
    }

    getById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`getById() with params:${JSON.stringify(req.params)} query:${JSON.stringify(req.query || {})}`);
            this.model
                .findByPk(req.params.id, req.query || {})
                .then((result) => {
                    debug(`getById() result:${JSON.stringify(result)}`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`getById() error. Err:${JSON.stringify(err.stack)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    getAll(): (req: Request, res: Response, next: NextFunction) => void {        
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`getAll() with query:${JSON.stringify(req.query || {})}`);
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            let includeFnResult = this.formatIncludeStr(req.query && req.query.include ? JSON.parse(req.query.include) : []);

            if (includeFnResult.error) {
                debug('getAll() include format error.');
                return res.status(400).send({ name: 'WRONG_FORMAT', message: 'Include Format Error' });
            }

            let filter: any = {
                where: where,
                offset: req.query.offset && !isNaN(req.query.offset) ? parseInt(req.query.offset) : 0,
                limit: req.query.limit && !isNaN(req.query.limit) ? parseInt(req.query.limit) : 1000 * 1000 * 1000,
                order: req.query.order ? JSON.parse(req.query.order) : [],
                include: includeFnResult.formattedInclude
            };

            if (req.query.attributes)
                filter.attributes = JSON.parse(req.query.attributes);

            debug(`getAll() calling findAll() with filter: ${JSON.stringify(filter)}`);
            this.model.findAll(filter)
                .then((result: any[]) => {
                    debug(`getAll() calling findAll() returned ${result.length} items`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`getAll() calling findAll() error. Err:${JSON.stringify(err.stack)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    count(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`count() with query:${JSON.stringify(req.query || {})}`);
            let where = req.query && req.query.where ? JSON.parse(req.query.where) : {};
            let filter = {
                where: where,
                include: this.formatIncludeStr(req.query && req.query.include ? JSON.parse(req.query.include) : []).formattedInclude
            };

            this.model
                .count(filter)
                .then((result: number) => {
                    debug(`count() result:${JSON.stringify(result)}`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`count() error. Err:${JSON.stringify(err.stack)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    create(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`create() with body:${JSON.stringify(req.body || {})}`);
            this.model
                .create(req.body)
                .then((result) => {
                    debug(`create() result:${JSON.stringify(result)}`);
                    return res.json(result.get());
                })
                .catch((err: Error) => {
                    debug(`create() error. Err:${JSON.stringify(err.stack)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    updateById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug(`updateById() with params:${JSON.stringify(req.params)} body:${JSON.stringify(req.body || {})}`);
            this.model
                .findByPk(req.params.id)
                .then((record) => {
                    if (!record) {
                        debug(`updateById() Could not find record.`);
                        return res.send({ name: 'error', message: 'Record not found!' });
                    }

                    record
                        .update(req.body)
                        .then((result) => {
                            debug(`updateById() result:${JSON.stringify(result)}`);
                            return res.json(result.get());
                        })
                        .catch((err: Error) => {
                            debug(`updateById()  updateAttributes error. Err:${JSON.stringify(err.stack)}`);
                            return res.status(400).send({ name: err.name, message: err.message });
                        });
                })
                .catch((err: Error) => {
                    debug(`updateById() findById error. Err:${JSON.stringify(err.stack)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    deleteById(): (req: Request, res: Response, next: NextFunction) => void {
        return (req: Request, res: Response, next: NextFunction) => {
            debug('deleteById() with params:${JSON.stringify(req.params)}');
            this.model
                .destroy({ where: { id: req.params.id } })
                .then((result: number) => {
                    debug(`deleteById() result:${JSON.stringify(result)}`);
                    return res.json(result);
                })
                .catch((err: Error) => {
                    debug(`deleteById() error. Err:${JSON.stringify(err.stack)}`);
                    return res.status(400).send({ name: err.name, message: err.message });
                });
        }
    }

    private formatIncludeStr(includeStr: any[]): { formattedInclude: any[], error: boolean } {
        if (!Array.isArray(includeStr)) {
            debug(`formatIncludeStr() Format error. Expecting array. includeStr:${JSON.stringify(includeStr)}`);
            return { formattedInclude: null, error: true };
        }

        let include = [];
        for (let i = 0; i < includeStr.length; i++) {
            debug(`formatIncludeStr() formatting include item. includeStr[i]:${JSON.stringify(includeStr[i])}`);
            let includeItem = {
                model: this.sequelizeModelList[includeStr[i].model],
                as: includeStr[i].as ? includeStr[i].as : includeStr[i].model,
                attributes: includeStr[i].attributes ? includeStr[i].attributes : undefined,
                where: includeStr[i].where ? includeStr[i].where : undefined
            };

            if (!includeStr[i].attributes)
                delete includeItem.attributes;

            if (includeStr[i].include) {
                let result = this.formatIncludeStr(includeStr[i].include);
                if (result.error)
                    return { formattedInclude: null, error: true };
                (includeItem as any).include = result.formattedInclude;
            }
            debug(`formatIncludeStr() formatted include item. includeItem:${JSON.stringify(includeItem)}`);
            include.push(includeItem);
        }
        return { formattedInclude: include, error: false };
    }
}