import { mocked } from 'ts-jest/utils';
import * as BlueBird from 'bluebird';
import {
    createNotification,
    getNotifications,
    getNotificationsCount,
    getProcessList,
    setNotificationStatus,
} from '../notification';
import Notification from '../models/notification';

jest.mock('../models/notification.ts');

const mockedNotification = mocked(Notification, false);

beforeEach((): void => {
    mockedNotification.mockReset();
});

describe('Notification Model Operations', (): void => {
    describe('createNotification', (): void => {
        test('Calls create function', (done): void => {
            mockedNotification.create.mockReturnValueOnce(BlueBird.resolve());
            createNotification({}).then((): void => {
                expect(mockedNotification.create.mock.calls.length).toBe(1);
                done();
            });
        });

        test('Rejects on error', (done): void => {
            mockedNotification.create.mockReturnValueOnce(BlueBird.reject('Reject Error'));
            createNotification({}).catch((e): void => {
                expect(mockedNotification.create.mock.calls.length).toBe(1);
                expect(e).toBe('Reject Error');
                done();
            });
        });
    });
});
