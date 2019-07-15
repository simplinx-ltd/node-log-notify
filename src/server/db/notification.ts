import Notification from './models/notification';
import { WhereOptions } from 'sequelize';

export function createNotification(values: object): Promise<boolean> {
    return new Promise<boolean>((resolve, reject): void => {
        let notification: Notification = values as Notification;

        // Strip '\n'
        if (notification.message) notification.message.replace(/(\r\n|\n|\r)/gm, '');

        Notification.create(notification)
            .then((): void => {
                return resolve(true);
            })
            .catch((e): void => {
                return reject(e);
            });
    });
}

export function getNotifications(where: WhereOptions, limit?: number): Promise<Notification[]> {
    return new Promise<Notification[]>((resolve, reject): void => {
        Notification.findAll({
            where,
            limit,
            order: [['id', 'DESC']],
        })
            .then((rows): void => {
                return resolve(rows);
            })
            .catch((e): void => {
                return reject(e);
            });
    });
}

export function getNotificationsCount(where: WhereOptions): Promise<number> {
    return new Promise<number>((resolve, reject): void => {
        Notification.count({ where })
            .then((count): void => {
                return resolve(count);
            })
            .catch((e): void => {
                return reject(e);
            });
    });
}

export function setNotificationStatus(id: number, status: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject): void => {
        Notification.update({ status }, { where: { id } })
            .then((): void => {
                return resolve(true);
            })
            .catch((e): void => {
                return reject(e);
            });
    });
}

export function getProcessList(where: WhereOptions): Promise<string[]> {
    return new Promise<string[]>((resolve, reject): void => {
        Notification.findAll({
            where,
            attributes: ['processName'],
        })
            .then((rows): void => {
                let list: string[] = rows.map((row): string => row.processName);
                return resolve(list);
            })
            .catch((e): void => {
                return reject(e);
            });
    });
}
