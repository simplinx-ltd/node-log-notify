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

    describe('getNotifications', (): void => {
        test('Calls findAll function', (done): void => {
            mockedNotification.findAll.mockReturnValueOnce(BlueBird.resolve([]));
            getNotifications({}).then((): void => {
                expect(mockedNotification.findAll.mock.calls.length).toBe(1);
                done();
            });
        });

        test('Calls findAll with where & limit options', (done): void => {
            let whereOptions = { id: 1 };
            let limit = 10;
            mockedNotification.findAll.mockReturnValueOnce(BlueBird.resolve([]));
            getNotifications(whereOptions, limit).then((): void => {
                expect(mockedNotification.findAll.mock.calls.length).toBe(1);
                expect(mockedNotification.findAll.mock.calls[0][0].where).toEqual(whereOptions);
                expect(mockedNotification.findAll.mock.calls[0][0].limit).toEqual(limit);
                done();
            });
        });

        test('Returns result', (done): void => {
            let result = new Notification();
            result.processName = 'ProcessName';
            mockedNotification.findAll.mockReturnValueOnce(BlueBird.resolve([result]));
            getNotifications({}).then((res): void => {
                expect(mockedNotification.findAll.mock.calls.length).toBe(1);
                expect(Array.isArray(res)).toBeTruthy();
                expect(res.length).toBe(1);
                expect(res[0]).toEqual(result);
                done();
            });
        });

        test('Rejects on error', (done): void => {
            mockedNotification.findAll.mockReturnValueOnce(BlueBird.reject('Reject Error'));
            getNotifications({}).catch((e): void => {
                expect(mockedNotification.findAll.mock.calls.length).toBe(1);
                expect(e).toBe('Reject Error');
                done();
            });
        });
    });

    describe('getNotificationsCount', (): void => {
        test('Calls count function', (done): void => {
            mockedNotification.count.mockReturnValueOnce(BlueBird.resolve(1));
            getNotificationsCount({}).then((): void => {
                expect(mockedNotification.count.mock.calls.length).toBe(1);
                done();
            });
        });

        test('Calls count with where options', (done): void => {
            let whereOptions = { id: 1 };
            mockedNotification.count.mockReturnValueOnce(BlueBird.resolve(10));
            getNotificationsCount(whereOptions).then((): void => {
                expect(mockedNotification.count.mock.calls.length).toBe(1);
                expect(mockedNotification.count.mock.calls[0][0].where).toEqual(whereOptions);
                done();
            });
        });

        test('Returns result', (done): void => {
            let count = 125;
            mockedNotification.count.mockReturnValueOnce(BlueBird.resolve(count));
            getNotificationsCount({}).then((res): void => {
                expect(mockedNotification.count.mock.calls.length).toBe(1);
                expect(res).toEqual(count);
                done();
            });
        });

        test('Rejects on error', (done): void => {
            mockedNotification.count.mockReturnValueOnce(BlueBird.reject('Reject Error'));
            getNotificationsCount({}).catch((e): void => {
                expect(mockedNotification.count.mock.calls.length).toBe(1);
                expect(e).toBe('Reject Error');
                done();
            });
        });
    });

    describe('setNotificationStatus()', (): void => {
        test('Calls setNotificationStatus function', (done): void => {
            let notificationModel: Notification[] = [];
            let id: number = 1;
            let status: string = 'EX';
            mockedNotification.update.mockReturnValueOnce(BlueBird.resolve([1, notificationModel]));
            setNotificationStatus(1, status).then((): void => {
                expect(mockedNotification.update.mock.calls.length).toBe(1);
                done();
            });
        });

        test('Rejects on Error', (done): void => {
            let notificationModel: Notification[] = [];
            let id: number = 1;
            let status: string = 'EX';
            mockedNotification.update.mockReturnValueOnce(BlueBird.reject('Reject Error'));
            setNotificationStatus(id, status).catch((err): void => {
                expect(mockedNotification.update.mock.calls.length).toBe(1);
                expect(err).toBe('Reject Error');
                done();
            });
        });        
    });

    describe('getProcessList', (): void => {
        test('Calls findAll function', (done): void => {
            mockedNotification.findAll.mockReturnValueOnce(BlueBird.resolve([]));
            getProcessList({}).then((): void => {
                expect(mockedNotification.findAll.mock.calls.length).toBe(1);
                done();
            });
        });

        test('Calls findAll with Where Option', (done): void => {
            let whereOption = { id: 1 };
            mockedNotification.findAll.mockReturnValueOnce(BlueBird.resolve([]));
            getProcessList(whereOption).then((): void => {
                expect(mockedNotification.findAll.mock.calls.length).toBe(1);
                expect(mockedNotification.findAll.mock.calls[0][0].where).toEqual(whereOption);
                done();
            });
        });

        test('Rejects on Error', (done): void => {
            mockedNotification.findAll.mockReturnValueOnce(BlueBird.reject('Reject Error'));
            getProcessList({}).catch((err): void => {
                expect(mockedNotification.findAll.mock.calls.length).toBe(1);
                expect(err).toBe('Reject Error');
                done();
            });
        });
    });

});
