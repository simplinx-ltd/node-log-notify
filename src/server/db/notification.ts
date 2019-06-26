import Notification from './models/notification';
import { WhereOptions } from 'sequelize';

export function createNotification(values: Object): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        Notification.create(values)
            .then(() => {
                return resolve(true);
            })
            .catch((e) => {
                return reject(e);
            });
    });
}

export function getNotifications(where: WhereOptions, limit: number): Promise<Notification[]> {
    return new Promise<Notification[]>((resolve, reject) => {
        Notification.findAll({
            where,
            limit,
            order: [['id', 'DESC']]
        })
            .then((rows) => {
                return resolve(rows);
            })
            .catch((e) => {
                return reject(e);
            });
    });
}

export function getNotificationsCount(where: WhereOptions): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        Notification.count({ where })
            .then((count) => {
                return resolve(count);
            })
            .catch((e) => {
                return reject(e);
            });
    });
}

export function setNotificationStatus(id: number, status: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        Notification.update({ status }, { where: { id } })
            .then((result) => {
                return resolve(true);
            })
            .catch((e) => {
                return reject(e);
            });
    });
}
