#!/usr/bin/env node

import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
import { Request, Response } from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as sequelize from 'sequelize';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import * as program from 'commander';
import * as log4js from 'log4js';
import * as pkg from './package.json';
import * as config from './config/config';
import * as mailAgent from './mail-agent/mail-agent';
import defineModels from './db/models';
import * as processAgentList from './process-agent/process-agent-list';
import { createNotification } from './db/notification';
import { createResourceCpu } from './db/resource-cpu';
import { createResourceMemory } from './db/resource-memory';
import { Config } from './config/config-type';
import api from './api/index';

// Logger
const logger = log4js.getLogger('MAIN');

// HTTP
let server: http.Server = null;
let app: express.Application = express();

// Db Connection
let connection: Sequelize = null;

// Arguments
program.name('node-log-watch');
program.version(pkg.version, '-v, --version');
program.option('-l, --log-level <log-level>', 'Log Level (trace,debug,info,warn,error,fatal)', 'info');
program.option('-c, --config-file <config-file>', 'Config File Path');
program.option('-x, --extract-config-file-template <path>', 'Extract Template Config File to Path');
program.parse(process.argv);

// Configure Logger
log4js.configure({
    appenders: { console: { type: 'console' } },
    categories: { default: { appenders: ['console'], level: program.logLevel } },
});

// Extract Config File
if (program.extractConfigFileTemplate) {
    try {
        config.extractConfigTemplateAsFile(path.resolve(program.extractConfigFileTemplate));
        logger.info('Config file extracted successfully.');
        logger.info('Exiting...');
        process.exit(0);
    } catch (e) {
        logger.fatal(e);
        logger.fatal('Exiting...');
        process.exit(-1);
    }
}

// Check arguments consistency
exitIfArgumentNotExists('--config-file', program.configFile, logger);

// Start
logger.info('App Starting...');
logger.info('Loading config...');
config
    .load(path.resolve(program.configFile))
    .then((): void => {
        const configData = config.get();

        // Db Connection
        connect2Db(configData.db)
            .then((): void => {
                logger.info('Connected to DB...');

                // Define Models
                defineModels(connection);

                // Http Server
                initHttpServer(configData, connection, server, app);

                // initialize mail-agent
                initMailAgent(configData);

                // initialize process-agents
                initProcessAgent(configData);
            })
            .catch((e): void => {
                logger.fatal('Could not connect to DB.');
                logger.fatal(e);
                logger.fatal('Exiting...');
                process.exit(-1);
            });
    })
    .catch((e): void => {
        logger.fatal('Could not load config file.');
        logger.fatal(e);
        logger.fatal('Exiting...');
        process.exit(-1);
    });

function connect2Db(dbConfig: SequelizeOptions): Promise<void> {
    // Sequelize Promise Config
    sequelize.Promise.config({
        warnings: false, // Disable warning output
        longStackTraces: true,
        cancellation: true,
        monitoring: true,
    });

    connection = new Sequelize(dbConfig);
    return connection.authenticate();
}

/**
 * Check Argument & Exit if not exists
 * @param argvName
 * @param argvValue
 * @param logger
 */
function exitIfArgumentNotExists(argvName: string, argvValue: string | null, logger: log4js.Logger): void {
    if (!argvValue) {
        logger.fatal(`We need this argument: ${argvName}`);
        logger.fatal('Exiting...');
        process.exit(-1);
    }
}

function initMailAgent(_configData: Config): void {
    try {
        mailAgent.initialize(
            _configData.sendMailOptions.nodeMailerTransportOptions,
            _configData.sendMailOptions.defaultTo,
            _configData.sendMailOptions.from,
        );
    } catch (e) {
        logger.fatal('Could not initialize mail agent.');
        logger.fatal(e);
        logger.fatal('Exiting...');
        process.exit(-1);
    }
}

function initProcessAgent(_configData: Config): void {
    try {
        _configData.processList.forEach((processConfig): void => {
            logger.debug(`Creating process-agent: ${JSON.stringify(processConfig)}`);
            processAgentList
                .create(
                    processConfig,
                    (notification): void => {
                        // Log Notification
                        createNotification({
                            processName: processConfig.name,
                            text2Watch: notification.text2Watch,
                            type: notification.type,
                            when2Notify: notification.when2Notify,
                            includeInDailyReport: notification.includeInDailyReport,
                            maxMessagePerDay: notification.maxMessagePerDay,
                            emailTo: notification.to || _configData.sendMailOptions.defaultTo,
                            emailFrom: notification.from || _configData.sendMailOptions.from,
                            emailSubject: notification.subject || _configData.sendMailOptions.defaultSubject,
                            message: notification.message,
                        });
                    },
                    (info): void => {
                        // Process Info & Process status
                        if (info.notification) {
                            createNotification({
                                processName: processConfig.name,
                                text2Watch: info.notification.text2Watch,
                                type: info.notification.type,
                                when2Notify: info.notification.when2Notify,
                                includeInDailyReport: info.notification.includeInDailyReport,
                                maxMessagePerDay: info.notification.maxMessagePerDay,
                                emailTo: info.notification.to || _configData.sendMailOptions.defaultTo,
                                emailFrom: info.notification.from || _configData.sendMailOptions.from,
                                emailSubject: info.notification.subject || _configData.sendMailOptions.defaultSubject,
                                message: info.notification.message,
                            });
                        }

                        let timestamp = new Date();
                        createResourceCpu(timestamp, processConfig.name, info.cpu);
                        createResourceMemory(timestamp, processConfig.name, info.memory);
                    },
                )
                .start();
        });
    } catch (e) {
        logger.fatal('Could not initialize process-agents.');
        logger.fatal(e);
        logger.fatal('Exiting...');
        process.exit(-1);
    }
}

function initHttpServer(
    _configData: Config,
    _connection: Sequelize,
    _server: http.Server,
    _app: express.Application,
): void {
    // Create Express Server
    _app.set('port', _configData.webOptions.port);
    _app.enable('trust proxy');
    _app.use(helmet());
    _app.use(compression());
    _app.use(bodyParser.json({ limit: '100kb' }));
    _app.use(bodyParser.urlencoded({ extended: true }));
    _app.use(cookieParser());
    _app.use(express.static(path.join(__dirname, 'public')));

    // APIs
    api(_configData, _app, _connection);

    // Error Handlers
    defineErrorHandlers(_app);

    _server = http.createServer(app);
    _server.listen(_configData.webOptions.port);

    _server.on('error', (error: Error): void => {
        throw error;
    });

    _server.on('listening', (): void => {
        logger.info('HTTP Server Listening on port ' + _configData.webOptions.port);
    });
}

interface ExpressError {
    status: number;
    message: string;
    stack: string;
}

function defineErrorHandlers(_app: express.Application): void {
    // catch 404 and forward to error handler
    _app.use(function(req: Request, res: Response /**, next: Function**/): void {
        // var err = new Error('Not Found');
        // err.status = 404;
        res.sendFile(__dirname + '/public/index.html');
        //next(err);
    });

    // development error handler
    // will print stacktrace
    if (process.env.NODE_ENV === 'development') {
        _app.use(function(err: ExpressError, req: Request, res: Response /**, next: Function**/): void {
            res.status(err.status || 500);
            if (!err.status || err.status === 500) logger.error('Error Handler:' + err.message);
            logger.error(err.stack);
            res.send({
                error: {
                    message: err.message || err.toString(),
                    error: err,
                },
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    _app.use(function(err: ExpressError, req: Request, res: Response /**, next: Function**/): void {
        res.status(err.status || 500);
        if (!err.status || err.status === 500) logger.error('Error Handler:' + err.message);
        res.send({
            error: {
                message: err.message || err.toString(),
            },
        });
    });
}
