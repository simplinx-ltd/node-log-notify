import * as nodeMailer from 'nodemailer';
import * as nodeSchedule from 'node-schedule';
import * as log4js from 'log4js';
import { Op } from 'sequelize';
import { getNotifications, getNotificationsCount, setNotificationStatus, getProcessList } from '../db/notification';
import { When } from '../process-agent/process-agent';
const logger = log4js.getLogger('MAIL');

let isInitialized: boolean = false;
let defaultTo: string;
let defaultFrom: string;
const CHECK_INTERVAL = 10 * 1000;
let mailTransport: nodeMailer.Transporter = null;

export enum NotificationStatus {
    NEW = 'NEW',
    SENT = 'SENT',
    OMIT = 'OMIT'
}

interface IDailyReport {
    [index: string]: {
        restartCount: number;
        failureCount: number;
        notificationList: {
            [index: string]: number
        }
    }
}

export function initialize(nodeMailerTransportOptions: any, _defaultTo: string, _defaultFrom: string) {
    if (isInitialized)
        return logger.warn('Already initialized. Omitting.');

    logger.info('Initializing....');
    mailTransport = nodeMailer.createTransport(nodeMailerTransportOptions);
    defaultTo = _defaultTo;
    defaultFrom = _defaultFrom;

    start();
}

function start() {
    // Cyclic
    setInterval(() => {
        // Check if we have mail to send
        getNotifications({ status: NotificationStatus.NEW, when2Notify: When.immediately }, 3)
            .then((rows) => {
                let dt = new Date();
                rows.forEach((row) => {
                    // Decide if we exceed mail limit                    
                    getNotificationsCount({
                        processName: row.processName,
                        type: row.type,
                        text2Watch: row.text2Watch,
                        status: NotificationStatus.SENT,
                        createdAt: {
                            [Op.gte]: new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate())),
                            [Op.lte]: new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59))
                        }
                    })
                        .then((count) => {
                            if (count >= row.maxMessagePerDay) {
                                logger.info(`Omitting Message id:${row.id} processName:${row.processName} type:${row.type}. maxMessagePerDay limit excedeed.`);
                                setNotificationStatus(row.id, NotificationStatus.OMIT)
                                    .then(() => { })
                                    .catch((e) => {
                                        logger.error('Error occured: setNotificationStatus');
                                        logger.error(e);
                                    })
                            } else {
                                // Send Notification
                                mailTransport.sendMail({
                                    to: row.emailTo,
                                    from: row.emailFrom,
                                    subject: row.emailSubject,
                                    html: row.message
                                })
                                    .then((info) => {
                                        logger.info(`Message Sent. id:${row.id} processName:${row.processName} type:${row.type}.`);
                                        setNotificationStatus(row.id, NotificationStatus.SENT)
                                            .then(() => { })
                                            .catch((e) => {
                                                logger.error('Error occured: setNotificationStatus, SENT');
                                                logger.error(e);
                                            })
                                    })
                                    .catch((e) => {
                                        logger.error('Error occured: sendMail');
                                        logger.error(e);
                                    })
                            }
                        })
                        .catch((e) => {
                            logger.error('Error occured: getNotificationsCount');
                            logger.error(e);
                        })
                });
            })
            .catch((e) => {
                logger.error('Error occured: getNotifications');
                logger.error(e);
            });
    }, CHECK_INTERVAL);

    // Daily Job at 00:05
    nodeSchedule.scheduleJob('05 00 * * *', () => {
        logger.info('Generating daily report');
        let dt = new Date();
        let startDate = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1));
        let endDate = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 23, 59, 59));

        let report: IDailyReport = {}
        getNotifications({
            createdAt: {
                [Op.gte]: startDate,
                [Op.lte]: endDate
            }
        })
            .then((rows) => {
                for (let i = 0; i < rows.length; i++) {
                    let row = rows[i];
                    if (!report[row.processName])
                        report[row.processName] = {
                            restartCount: 0,
                            failureCount: 0,
                            notificationList: {}
                        }
                    switch (row.type) {
                        case 'restart':
                            report[row.processName].restartCount++;
                            break;
                        case 'failure':
                            report[row.processName].failureCount++;
                            break;
                        case 'log-notify':
                            if (!report[row.processName].notificationList[row.text2Watch])
                                report[row.processName].notificationList[row.text2Watch] = 0;
                            report[row.processName].notificationList[row.text2Watch]++;
                            break;
                    }
                }

                // Generate Report
                let message: string = `<h3>Daily Report - node-log-notify</h3> <hr/>`;
                Object.keys(report).forEach((key) => {
                    message += `<h4>Process Name: ${key}</h4>`;
                    message += '<p>';
                    message += `Restart Count: ${report[key].restartCount}<br/>`;
                    message += `Failure Count: ${report[key].failureCount}<br/>`;

                    Object.keys(report[key].notificationList).forEach((keyN) => {
                        message += `${keyN}(text2Watch): ${report[key].notificationList[keyN]}<br/>`;
                    });

                    message += '</p>';
                    message += '<br/>';
                });
                // Strip '\n'
                message.replace(/(\r\n|\n|\r)/gm, '');

                logger.debug(`Daily Report: ${message}`);

                // Send Mail
                mailTransport.sendMail({
                    to: defaultTo,
                    from: defaultFrom,
                    subject: 'Daily Report - node-log-notify',
                    html: message
                })
                    .then((info) => {
                        logger.info(`Daily Report sent.`);
                    })
                    .catch((e) => {
                        logger.error('Error occured: sendMail(daily)');
                        logger.error(e);
                    })

            })
            .catch((e) => {
                logger.error('Error occured: getNotifications(daily)');
                logger.error(e);
            });
    });
}