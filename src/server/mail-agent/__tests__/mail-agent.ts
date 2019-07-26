import { mocked } from 'ts-jest/utils';
import mailAgent, { NotificationStatus } from '../mail-agent';
import * as notification from '../../db/notification';
import * as nodeMailer from 'nodemailer';

jest.mock('nodemailer');
jest.mock('../../db/notification');

const mockCreateTransport = mocked(nodeMailer.createTransport, false);
const mockNotification = mocked(notification, true);
const spyStart = jest.spyOn(mailAgent, 'start');

jest.useFakeTimers();

// Promises
function flushPromises(): Promise<any> {
    return new Promise((resolve): NodeJS.Immediate => setImmediate(resolve));
}

// nodeMailer - sendMail
const spySendMail = jest.fn();
mockCreateTransport.mockImplementation(
    (): nodeMailer.Transporter => {
        return ({
            sendMail: spySendMail,
        } as unknown) as nodeMailer.Transporter;
    },
);

describe('Mail Agent', (): void => {
    test('initialize function', (): void => {
        jest.clearAllTimers();
        mailAgent.initialize(null, '', '');
        expect(mockCreateTransport.mock.calls.length).toBe(1);
        expect(spyStart).toHaveBeenCalled();
    });

    test('Mail Count < maxMessagePerDay then send mails', (done): void => {
        mockNotification.getNotifications.mockResolvedValueOnce([{ id: 10, maxMessagePerDay: 2 } as any]);
        mockNotification.getNotificationsCount.mockResolvedValueOnce(1);
        mockNotification.setNotificationStatus.mockResolvedValueOnce(null);
        spySendMail.mockResolvedValue(true);

        jest.clearAllTimers();
        mailAgent.start();
        jest.runOnlyPendingTimers();
        flushPromises().then((): void => {
            expect(mockNotification.getNotifications.mock.calls.length).toBe(1);
            expect(spySendMail.mock.calls.length).toBe(1);
            expect(mockNotification.setNotificationStatus.mock.calls.length).toBe(1);
            expect(mockNotification.setNotificationStatus.mock.calls[0][0]).toBe(10); //id
            expect(mockNotification.setNotificationStatus.mock.calls[0][1]).toBe(NotificationStatus.SENT); //id
            done();
        });
    });

    test('Mail Count > maxMessagePerDay then changes status', (done): void => {
        mockNotification.getNotifications.mockResolvedValueOnce([{ id: 10, maxMessagePerDay: 2 } as any]);
        mockNotification.getNotificationsCount.mockResolvedValueOnce(2);
        mockNotification.setNotificationStatus.mockResolvedValueOnce(null);
        spySendMail.mockReset();

        jest.clearAllTimers();
        mailAgent.start();
        jest.runOnlyPendingTimers();
        flushPromises().then((): void => {
            expect(mockNotification.getNotifications.mock.calls.length).toBe(1);
            expect(spySendMail.mock.calls.length).toBe(0);
            expect(mockNotification.setNotificationStatus.mock.calls.length).toBe(1);
            expect(mockNotification.setNotificationStatus.mock.calls[0][0]).toBe(10); //id
            expect(mockNotification.setNotificationStatus.mock.calls[0][1]).toBe(NotificationStatus.OMIT); //id
            done();
        });
    });

    test('Catch getNotifications error', (done): void => {
        mockNotification.getNotifications.mockRejectedValueOnce(null);

        jest.clearAllTimers();
        mailAgent.start();
        jest.runOnlyPendingTimers();
        flushPromises().then((): void => {
            expect(mockNotification.getNotifications.mock.calls.length).toBe(1);
            expect(mockNotification.getNotificationsCount.mock.calls.length).toBe(0);
            done();
        });
    });

    test('Catch getNotificationsCount error', (done): void => {
        mockNotification.getNotifications.mockResolvedValueOnce([{} as any]);
        mockNotification.getNotificationsCount.mockRejectedValueOnce(null);

        jest.clearAllTimers();
        mailAgent.start();
        jest.runOnlyPendingTimers();
        flushPromises().then((): void => {
            expect(mockNotification.getNotifications.mock.calls.length).toBe(1);
            expect(mockNotification.getNotificationsCount.mock.calls.length).toBe(1);
            expect(spySendMail.mock.calls.length).toBe(0);
            expect(mockNotification.setNotificationStatus.mock.calls.length).toBe(0);
            done();
        });
    });

    test('Catch setNotificationStatus - 1 ', (done): void => {
        mockNotification.getNotifications.mockResolvedValueOnce([{ id: 10, maxMessagePerDay: 2 } as any]);
        mockNotification.getNotificationsCount.mockResolvedValueOnce(3);
        mockNotification.setNotificationStatus.mockRejectedValueOnce(null);

        jest.clearAllTimers();
        mailAgent.start();
        jest.runOnlyPendingTimers();
        flushPromises().then((): void => {
            expect(mockNotification.getNotifications.mock.calls.length).toBe(1);
            expect(spySendMail.mock.calls.length).toBe(0);
            expect(mockNotification.setNotificationStatus.mock.calls.length).toBe(1);
            done();
        });
    });

    test('Catch setNotificationStatus - 2 ', (done): void => {
        mockNotification.getNotifications.mockResolvedValueOnce([{ id: 10, maxMessagePerDay: 2 } as any]);
        mockNotification.getNotificationsCount.mockResolvedValueOnce(1);
        mockNotification.setNotificationStatus.mockRejectedValueOnce(null);
        spySendMail.mockResolvedValue(true);

        jest.clearAllTimers();
        mailAgent.start();
        jest.runOnlyPendingTimers();
        flushPromises().then((): void => {
            expect(mockNotification.getNotifications.mock.calls.length).toBe(1);
            expect(spySendMail.mock.calls.length).toBe(1);
            expect(mockNotification.setNotificationStatus.mock.calls.length).toBe(1);
            done();
        });
    });

    test('Catch sendMail Error ', (done): void => {
        mockNotification.getNotifications.mockResolvedValueOnce([{ id: 10, maxMessagePerDay: 2 } as any]);
        mockNotification.getNotificationsCount.mockResolvedValueOnce(1);
        mockNotification.setNotificationStatus.mockRejectedValueOnce(null);
        spySendMail.mockRejectedValueOnce(null);

        jest.clearAllTimers();
        mailAgent.start();
        jest.runOnlyPendingTimers();
        flushPromises().then((): void => {
            expect(mockNotification.getNotifications.mock.calls.length).toBe(1);
            expect(spySendMail.mock.calls.length).toBe(1);
            expect(mockNotification.setNotificationStatus.mock.calls.length).toBe(0);
            done();
        });
    });
});
