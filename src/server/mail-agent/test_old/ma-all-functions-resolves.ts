import { mocked } from 'ts-jest/utils';
import * as log4js from 'log4js';
import * as nodeMailer from 'nodemailer';

import * as MailAgent from '../mail-agent';
import * as notification from '../../db/notification';
import NotificationModel from '../../db/models/notification';

jest.mock('../../db/notification');
jest.mock(
    'log4js',
    (): log4js.Logger => {
        function getLogger(): log4js.Logger {
            function info(message?: string): jest.Mock {
                return spyInfo(message);
            }

            function debug(message?: string): jest.Mock {
                return spyDebug(message);
            }

            function trace(message?: string): jest.Mock {
                return spyTrace(message);
            }

            function warn(message?: string): jest.Mock {
                return spyWarn(message);
            }

            function error(message?: string): jest.Mock {
                return spyError(message);
            }

            return ({ info, debug, trace, warn, error } as unknown) as log4js.Logger;
        }
        return ({ getLogger } as unknown) as log4js.Logger;
    },
);

jest.mock(
    'node-schedule',
    (): jest.Mock => {
        function scheduleJob(rule: string, callback: Function): Function {
            return callback();
        }

        return ({ scheduleJob } as unknown) as jest.Mock;
    },
);

jest.mock(
    'nodemailer',
    (): nodeMailer.Transporter => {
        function createTransport(): nodeMailer.Transporter {
            return spyMailTransporter();
        }

        return ({ createTransport } as unknown) as nodeMailer.Transporter;
    },
);

// log4js - logger
const spyError = jest.fn().mockReturnValue((message?: string): string => message);
const spyWarn = jest.fn().mockReturnValue((message?: string): string => message);
const spyInfo = jest.fn().mockReturnValue((message?: string): string => message);
const spyTrace = jest.fn().mockReturnValue((message?: string): string => message);
const spyDebug = jest.fn().mockReturnValue((message?: string): string => message);

// nodeMailer - transporter
const spyMailTransporter = jest.fn().mockImplementation(
    (): nodeMailer.Transporter => {
        return ({ sendMail: spySendMail } as unknown) as nodeMailer.Transporter;
    },
);

// nodeMailer - sendMail
const spySendMail = jest.fn().mockImplementation(function sendMail(): Promise<boolean> {
    return Promise.resolve(true);
});

// notifications
const mockedNotification = mocked(notification, false);

// Notification Array for Mock
const notificationArray = [
    {
        id: 1,
        processName: 'test',
        status: 'NEW',
        type: 'restart',
        text2Watch: null,
        when2Notify: 'immediately',
        includeInDailyReport: true,
        maxMessagePerDay: 10,
        emailTo: 'ex@example.org',
        emailFrom: 'ex@example.org',
        emailSubject: 'node-log-notify',
        message: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

beforeEach((): void => {
    jest.useFakeTimers();
});

afterEach((): void => {
    mockedNotification.getNotifications.mockReset();
    mockedNotification.getNotificationsCount.mockReset();
    jest.clearAllTimers();
});

afterAll((): void => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
});

describe('MailAgent Tests', (): void => {
    describe('All Functions Resolves', (): void => {
        describe('getNotifications Function Resolves an Array That Has One Object', (): void => {
            test('getNotifications Should Be Called 2 Times', async (done): Promise<void> => {
                mockedNotification.getNotifications.mockResolvedValueOnce(notificationArray as NotificationModel[]);
                mockedNotification.getNotifications.mockRejectedValue('');

                MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
                jest.runOnlyPendingTimers();

                expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
                expect(await spyMailTransporter).toHaveBeenCalledTimes(1); //in nodeSchedule
                done();
            });

            test('getNotificationsCount Function Resolves Number That Greater Than maxMessagePerDay(10): setNotificationStatus Function Should Be Called 1 Time', async (done): Promise<
                void
            > => {
                mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);
                mockedNotification.getNotificationsCount.mockResolvedValue(20);
                mockedNotification.setNotificationStatus.mockResolvedValue(true);

                MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
                jest.runOnlyPendingTimers();
                expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
                expect(await mockedNotification.getNotificationsCount).toHaveBeenCalledTimes(1);
                expect(await mockedNotification.setNotificationStatus).toHaveBeenCalledTimes(1);
                done();
            });

            test('getNotificationsCount Function Resolves Number That Less Than maxMessagePerDay(10): sendMail Function Should Be Called 2 Times', async (done): Promise<
                void
            > => {
                mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);
                mockedNotification.getNotificationsCount.mockResolvedValue(4);

                MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
                jest.runOnlyPendingTimers();
                expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
                expect(await mockedNotification.getNotificationsCount).toHaveBeenCalledTimes(1);
                expect(await spySendMail).toHaveBeenCalledTimes(2);
                done();
            });

            test('getNotificationsCount Function Resolves Number That Less Than maxMessagePerDay(10): setNotificationStatus Function Should Be Called 1 Time', async (done): Promise<
                void
            > => {
                mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);
                mockedNotification.getNotificationsCount.mockResolvedValue(4);
                mockedNotification.setNotificationStatus.mockResolvedValue(true);

                MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
                jest.runOnlyPendingTimers();
                expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
                expect(await mockedNotification.getNotificationsCount).toHaveBeenCalledTimes(1);
                expect(await mockedNotification.setNotificationStatus).toHaveBeenCalledTimes(1);
                done();
            });

            test('getNotifications and sendMail Functions Should Be Called 1 Time in nodeSchedule', async (done): Promise<
                void
            > => {
                mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);

                MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');

                expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(1);
                expect(await spySendMail).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });
});
