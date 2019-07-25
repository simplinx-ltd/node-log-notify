import { mocked } from 'ts-jest/utils';
import * as log4js from 'log4js';
import * as nodeMailer from 'nodemailer';
import * as nodeSchedule from 'node-schedule';

import * as MailAgent from '../mail-agent';
import * as notification from '../../db/notification';

jest.mock('../../db/notification');
jest.mock(
    'log4js',
    (): log4js.Logger => {
        function getLogger(): log4js.Logger {
            function info(message?: string): jest.Mock {
                return spyInfo(message);
            }

            function error(message?: string): jest.Mock {
                return spyError(message);
            }

            return ({ info, error } as unknown) as log4js.Logger;
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
const spyInfo = jest.fn().mockReturnValue((message?: string): string => message);

// nodeMailer - transporter
const spyMailTransporter = jest.fn().mockImplementation(
    (): nodeMailer.Transporter => {
        function sendMail(): Promise<boolean> {
            return Promise.resolve(true);
        }

        return ({ sendMail } as unknown) as nodeMailer.Transporter;
    },
);

// nodeSchedule - scheduleJob
const spyScheduleJob = jest.spyOn(nodeSchedule, 'scheduleJob');

// notifications
const mockedNotification = mocked(notification, false);

beforeEach((): void => {
    jest.useFakeTimers();
});

afterEach((): void => {
    mockedNotification.getNotifications.mockReset();
    mockedNotification.getNotificationsCount.mockReset();
    jest.clearAllTimers();
});

describe('MailAgent Tests', (): void => {
    describe('initialize and start Functions Tests | getNotifications Function Resolves', (): void => {
        test('initialize Function Should Be Called and The start Function Should Be Called by Initialize Function', (): void => {
            mockedNotification.getNotifications.mockReturnValue(Promise.resolve([]));

            MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
            jest.runOnlyPendingTimers();

            expect(mockedNotification.getNotifications.mock.calls.length).toBe(2);
            expect(spyInfo).toHaveBeenCalledTimes(2);
            expect(spyInfo.mock.calls[0][0]).toBe('Initializing....');
            expect(spyMailTransporter).toHaveBeenCalledTimes(1);
        });

        test('start Function Should Be Called By initialize Function and setInterval and nodeSchedule Should Be Called One Time in start Function', (): void => {
            mockedNotification.getNotifications.mockReturnValue(Promise.resolve([]));

            MailAgent.initialize('_transporterOptions', '_defaultTo', '_defaultFrom');
            jest.runOnlyPendingTimers();

            expect(setInterval).toBeCalledTimes(1);
            expect(spyScheduleJob).toBeCalledTimes(1);
            expect(spyInfo.mock.calls[1][0]).toBe('Generating daily report');
            expect(spyInfo).toHaveBeenCalledTimes(2);
        });
    });
});
