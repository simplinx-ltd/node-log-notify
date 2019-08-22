const configTemplate = `{
    "webOptions": {
        "port": 8085,
        "username": "user",
        "password": "PASSWORD"
    },
    "db": {
        "dialect": "sqlite",
        "storage": "node-log-notify.db",
        "logging": false
    },
    "sendMailOptions": {
        "nodeMailerTransportOptions": {
            "host": "mail.example.com",
            "port": 465,
            "secure": true,
            "auth": {
                "user": "node-log-notify@example.com",
                "pass": "PASSWORD"
            }
        },
        "from": "node-log-watch",
        "defaultTo": "xxx@gmail.com",
        "defaultSubject": "Process Notification",
        "sendDailyReport":true
    },
    "processList": [
        {
            "name": "app-1",
            "processManagerType": "pm2",
            "process2Watch": "app-1",
            "notifyOnRestart": {
                "enable": true,
                "when2Notify": "immediately",
                "maxMessagePerDay": 10,
                "includeInDailyReport":true
            },
            "notifyOnFailure": {
                "enable": true,
                "when2Notify": "immediately",
                "maxMessagePerDay": 10,
                "includeInDailyReport":true
            },
            "logWatchList": [
                {
                    "text2Watch": "Critical Error",
                    "lineCount2RecordBefore": 10,
                    "lineCount2RecordAfter": 5,
                    "when2Notify": "immediately",
                    "maxMessagePerDay": 10,
                    "includeInDailyReport":true,
                    "mailOptions": {
                        "messagePrefix": "Critical Error Occured",
                        "subject": "Need Help: Critical Error"
                    }
                }
            ]
        }
    ]
}`;

export default configTemplate;
