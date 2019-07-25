import { mocked } from 'ts-jest/utils';
import * as log4js from 'log4js';
import * as nodeMailer from 'nodemailer';
import * as nodeSchedule from 'node-schedule';

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
    return Promise.reject('rejectError');
});

// nodeSchedule - scheduleJob
const spyScheduleJob = jest.spyOn(nodeSchedule, 'scheduleJob');

// notifications
const mockedNotification = mocked(notification, false);

// Notification Array for Mock
const notificationArray = [
    {
        id: 1,
        processName: 'test',
        status: 'NEW',
        type: 'log-notify',
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

describe('MailAgent Tests', (): void => {
    describe('Testing Rejections', (): void => {
        test('logger.error Should Be Called 4 Times | getNotifications Rejects ', async (done): Promise<void> => {
            mockedNotification.getNotifications.mockRejectedValue('rejectError');

            MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
            jest.runOnlyPendingTimers();

            expect.assertions(6);
            expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
            expect(await spyError).toHaveBeenCalledTimes(4);
            expect(await spyError.mock.calls[0][0]).toBe('Error occured: getNotifications(daily)'); // from nodeSchedule
            expect(await spyError.mock.calls[1][0]).toBe('rejectError');
            expect(await spyError.mock.calls[2][0]).toBe('Error occured: getNotifications');
            expect(await spyError.mock.calls[3][0]).toBe('rejectError');
            done();
        });

        test('logger.error Should be Called 4 Times | getNotificationsCount Rejects', async (done): Promise<void> => {
            mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);
            mockedNotification.getNotificationsCount.mockRejectedValue('rejectError');

            MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
            jest.runOnlyPendingTimers();

            expect.assertions(7);
            expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
            expect(await mockedNotification.getNotificationsCount).toBeCalledTimes(1);
            expect(await spyError).toHaveBeenCalledTimes(4);
            expect(await spyError.mock.calls[0][0]).toBe('Error occured: sendMail(daily)'); // from nodeSchedule
            expect(await spyError.mock.calls[1][0]).toBe('rejectError');
            expect(await spyError.mock.calls[2][0]).toBe('Error occured: getNotificationsCount');
            expect(await spyError.mock.calls[3][0]).toBe('rejectError');
            done();
        });

        test('logger.error Should be Called 4 Times | getNotificationsCount Resolves Number that Greater Than maxMessagePerDat and setNotificationStatus Rejects', async (done): Promise<
            void
        > => {
            mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);
            mockedNotification.getNotificationsCount.mockResolvedValue(20);
            mockedNotification.setNotificationStatus.mockRejectedValue('rejectError');

            MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
            jest.runOnlyPendingTimers();

            expect.assertions(8);
            expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
            expect(await mockedNotification.getNotificationsCount).toBeCalledTimes(1);
            expect(await mockedNotification.setNotificationStatus).toHaveBeenCalledTimes(1);
            expect(await spyError).toHaveBeenCalledTimes(4);
            expect(await spyError.mock.calls[0][0]).toBe('Error occured: sendMail(daily)');
            expect(await spyError.mock.calls[1][0]).toBe('rejectError');
            expect(await spyError.mock.calls[2][0]).toBe('Error occured: setNotificationStatus');
            expect(await spyError.mock.calls[3][0]).toBe('rejectError');
            done();
        });

        test('logger.error Should be Called 2 Times | getNotificationsCount Resolves Number that Less Than maxMessagePerDat and setNotificationStatus Rejects', async (done): Promise<
            void
        > => {
            mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);
            mockedNotification.getNotificationsCount.mockResolvedValue(1);
            mockedNotification.setNotificationStatus.mockRejectedValue('rejectError');

            MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
            jest.runOnlyPendingTimers();

            expect.assertions(7);
            expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(2);
            expect(await mockedNotification.getNotificationsCount).toBeCalledTimes(1);
            expect(await spyError).toHaveBeenCalledTimes(2);
            expect(await spyError.mock.calls[0][0]).toBe('Error occured: sendMail(daily)');
            expect(await spyError.mock.calls[1][0]).toBe('rejectError');
            expect(await spyError.mock.calls[2][0]).toBe('Error occured: sendMail');
            expect(await spyError.mock.calls[3][0]).toBe('rejectError');
            done();
        });

        test('sendMail Should be Called 1 Time | sendMail Rejects in nodeSchedule', async (done): Promise<void> => {
            mockedNotification.getNotifications.mockResolvedValue(notificationArray as NotificationModel[]);

            MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');

            // expect.assertions(2);
            expect(await mockedNotification.getNotifications).toHaveBeenCalledTimes(1);
            expect(await spySendMail).toHaveBeenCalledTimes(1);
            expect(await spyError).toHaveBeenCalledTimes(2);
            expect(await spyError.mock.calls[0][0]).toBe('Error occured: sendMail(daily)');
            expect(await spyError.mock.calls[1][0]).toBe('rejectError');

            done();
        });
    });
});
