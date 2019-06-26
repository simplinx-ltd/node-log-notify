const configTemplate = `{
    "db": {
        "dialect": "mysql",
        "host": "localhost",
        "database": "node-log-notify",
        "username": "node-log-notify",
        "password": "PASS",
        "logging": false,
        "port": 3306
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
        "defaultSubject": "Process Notification"
    },
    "processList": [
        {
            "name": "app-1",
            "processManagerType": "pm2",
            "process2Watch": "app-1",
            "notifyOnRestart": {
                "enable": true,
                "when2Notify": "immediately",
                "maxMessagePerDay": 10
            },
            "notifyOnFailure": {
                "enable": true,
                "when2Notify": "immediately",
                "maxMessagePerDay": 10
            },
            "logWatchList": [
                {
                    "text2Watch": "Critical Error",
                    "lineCount2RecordBefore": 10,
                    "lineCount2RecordAfter": 5,
                    "when2Notify": "immediately",
                    "maxMessagePerDay": 10,
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