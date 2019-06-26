import * as nodeMailer from 'nodemailer';
import * as nodeSchedule from 'node-schedule';
import * as log4js from 'log4js';
import { Op } from 'sequelize';
import { getNotifications, getNotificationsCount, setNotificationStatus } from '../db/notification';
import { When } from '../process-agent/process-agent';
const logger = log4js.getLogger('MAIL');

let isInitialized: boolean = false;
const CHECK_INTERVAL = 10 * 1000;
let mailTransport: nodeMailer.Transporter = null;

export enum NotificationStatus {
    NEW = 'NEW',
    SENT = 'SENT',
    OMIT = 'OMIT'
}

export function initialize(nodeMailerTransportOptions: any) {
    if (isInitialized)
        return logger.warn('Already initialized. Omitting.');

    logger.trace('Initializing....');
    mailTransport = nodeMailer.createTransport(nodeMailerTransportOptions);

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
                                        logger.info(info)
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

    // Daily Job at 22:00
    nodeSchedule.scheduleJob('00 22 * * *', () => {

    });
}