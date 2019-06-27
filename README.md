# Log Notify #
* Report Process Restart
* Report Process Failure
* Watch Process Output/Log 
* Notification e-mails
* Daily Report

## Installation
### install

``` sudo npm i node-log-notify -g ```

### Test Command Line

``` node-log-notify --version ```

### Command Line Options

``` node-log-notify --help ```

### Extract Config File Template

``` node-log-notify -x config.json ```

### Edit config.json

``` nano config.json ```

### Start App

``` node-log-notify -c config.json ```

### Start App with pm2
``` pm2 start node-log-notify -- -c config.json ```

### Configuration Example
```
{
    "webOptions":{
	"port":8085,
	"username":"USER",
	"password":"123456"
	},
    "db": {
        "dialect": "mysql",
        "host": "localhost",
        "database": "node-log-notify",
        "username": "node-log-notify",
        "password": "node-log-notify",
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
                "pass": "PASS"
            }
        },
        "from": "node-log-notify <node-log-notify@example.com>",
        "defaultTo": "XXX@gmail.com,YYY@gmail.com",
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
                "maxMessagePerDay": 1
            },
            "logWatchList": [
                {
                    "text2Watch": "Critical Error",
                    "lineCount2RecordBefore": 20,
                    "lineCount2RecordAfter": 15,
                    "when2Notify": "immediately",
                    "maxMessagePerDay": 10,
                    "mailOptions": {
                        "messagePrefix": "Help me!",
                        "subject": "Critical Error"
                    }
                }
            ]
        }
    ]
}
```


## License
MIT


#### [SimpLinx](https://www.simplinx.com)