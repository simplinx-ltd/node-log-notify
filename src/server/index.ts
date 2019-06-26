#!/usr/bin/env node

import * as path from 'path';
import * as  sequelize from 'sequelize';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import * as program from 'commander';
import * as log4js from 'log4js';
import * as pkg from './package.json'
import * as config from './config/config.js';
import { initialize } from './mail-agent/mail-agent.js';
import defineModels from './db/models';
import * as processAgentList from './process-agent/process-agent-list.js';
import { createNotification } from './db/notification.js';
import { createResourceCpu } from './db/resource-cpu.js';
import { createResourceMemory } from './db/resource-memory.js';

// Logger
const logger = log4js.getLogger('MAIN');

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
    categories: { default: { appenders: ['console'], level: program.logLevel } }
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
    .load(path.resolve(__dirname, program.configFile))
    .then(() => {
        const configData = config.get();

        // Db Connection
        connect2Db(configData.db)
            .then(() => {
                logger.info('Connected to DB...');

                // Define Models
                defineModels(connection);

                // initialize mail-agent
                try {
                    initialize(configData.sendMailOptions.nodeMailerTransportOptions);
                } catch (e) {
                    logger.fatal('Could not initialize mail agent.');
                    logger.fatal(e);
                    logger.fatal('Exiting...');
                    process.exit(-1);
                }

                // initialize process-agents
                try {
                    configData.processList.forEach((processConfig) => {
                        logger.debug(`Creating process-agent: ${JSON.stringify(processConfig)}`);
                        processAgentList.create(
                            processConfig,
                            (notification) => {
                                // Log Notification
                                createNotification(
                                    notification.type,
                                    notification.when2Notify,
                                    notification.maxMessagePerDay,
                                    notification.to || configData.sendMailOptions.defaultTo,
                                    notification.from || configData.sendMailOptions.from,
                                    notification.subject || configData.sendMailOptions.defaultSubject,
                                    notification.message
                                );
                            },
                            (info) => {
                                // Process Info & Process status
                                if (info.notification) {
                                    createNotification(
                                        info.notification.type,
                                        info.notification.when2Notify,
                                        info.notification.maxMessagePerDay,
                                        info.notification.to || configData.sendMailOptions.defaultTo,
                                        info.notification.from || configData.sendMailOptions.from,
                                        info.notification.subject || configData.sendMailOptions.defaultSubject,
                                        info.notification.message
                                    );
                                }

                                let timestamp = new Date();
                                createResourceCpu(timestamp, processConfig.name, info.cpu);
                                createResourceMemory(timestamp, processConfig.name, info.memory);

                            }).start();
                    });
                } catch (e) {
                    logger.fatal('Could not initialize process-agents.');
                    logger.fatal(e);
                    logger.fatal('Exiting...');
                    process.exit(-1);
                }
            })
            .catch((e) => {
                logger.fatal('Could not connect to DB.');
                logger.fatal(e);
                logger.fatal('Exiting...');
                process.exit(-1);
            });
    })
    .catch((e) => {
        logger.fatal('Could not load config file.');
        logger.fatal(e);
        logger.fatal('Exiting...');
        process.exit(-1);
    });


function connect2Db(dbConfig: SequelizeOptions): Promise<any> {
    // Sequelize Promise Config
    sequelize.Promise.config({
        warnings: false,        // Disable warning output
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
function exitIfArgumentNotExists(argvName: string, argvValue: string | null, logger: log4js.Logger) {
    if (!argvValue) {
        logger.fatal(`We need this argument: ${argvName}`);
        logger.fatal('Exiting...');
        process.exit(-1);
    }
}