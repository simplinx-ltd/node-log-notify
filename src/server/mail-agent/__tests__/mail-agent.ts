import { mocked } from 'ts-jest/utils';
import * as nodeMailer from 'nodemailer';

import * as MailAgent from '../mail-agent';
import NotificationModel from '../../db/models/notification';
import * as notification from '../../db/notification';

jest.mock('nodemailer');
jest.mock('../../db/notification');
jest.mock('../../db/models/notification');

let mockedNodeMailer = mocked(nodeMailer, false);
let mockedGetNotifications = mocked(notification.getNotifications, false);
jest.spyOn(MailAgent, 'initialize');

let notArr: NotificationModel[] = [];
mockedGetNotifications.mockResolvedValue(notArr);

describe('Test MailAgent', (): void => {
    describe('Initialize Function', (): void => {
        test('Calls Initialize Function', (): void => {
            let nodeMailerTransportOptions = mockedNodeMailer.createTransport.mockReturnValue(null);
            let _defaultTo = 'defaultTo';
            let _defaultFrom = 'defaultFrom';

            MailAgent.initialize(null, _defaultTo, _defaultFrom);
            expect(MailAgent.initialize).toHaveBeenCalledWith(null, _defaultTo, _defaultFrom);
            expect(MailAgent.initialize).toHaveBeenCalledTimes(1);
            expect(nodeMailerTransportOptions).toHaveBeenCalledTimes(1);
            expect(mockedNodeMailer.createTransport.mock.calls.length).toBe(1);
        });
    });

    describe('Start Function', (): void => {
        test('setInterval', (): void => {
            jest.useFakeTimers();
            MailAgent.start();
            expect(setInterval).toHaveBeenCalledTimes(1);
        });
    });
});
