import Notification from './models/notification';

export function createNotification(
    type: string,
    when2Notify: string,
    maxMessagePerDay: number,
    emailTo: string,
    emailFrom: string,
    emailSubject: string,
    message: string
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        Notification.create({
            type,
            when2Notify,
            maxMessagePerDay,
            emailTo,
            emailFrom,
            emailSubject,
            message
        })
            .then(() => {
                return resolve(true);
            })
            .catch((e) => {
                return reject(e);
            });
    });
}