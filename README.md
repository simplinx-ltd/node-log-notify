
<p align="center">
  <a href="https://github.com/simplinx-ltd/node-log-notify">
	<img alt="Notif.me" src="https://raw.githubusercontent.com/simplinx-ltd/node-log-notify/master/src/ui/src/assets/images/nlnIcon.png" />
  </a>
</p>

<p align="center">
  Generate process notifications easily.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/node-log-notify"><img alt="npm-status" src="https://img.shields.io/npm/v/node-log-notify.svg?style=flat&color=green" /></a>
  <a href="#"><img alt="code-size" src="https://img.shields.io/github/languages/code-size/simplinx-ltd/node-log-notify.svg" /></a>
	<a href="https://www.npmjs.com/package/node-log-notify"><img alt="downloads" src="https://img.shields.io/npm/dt/node-log-notify.svg?color=purple&label=npm%20downloads" /></a>
  <a href="https://github.com/simplinx-ltd/node-log-notify/blob/master/LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT_License-blue.svg?style=flat" /></a>
</p>


## What can `node-log-notify` do?
* Report Process Restart
* Report Process Failure
* Watch Process Output/Log
* Notification e-mails
* Daily Report

## Screenshots
<div>

#### Login and Notifications Pages
<p align="center">
  <a href="docs/screenshots/login.png" target="_blank">
  	<img src="https://raw.github.com/simplinx-ltd/node-log-notify/master/docs/screenshots/login.png?raw=true" width="350" title="Login" alt="Login">
  </a>
  <a href="docs/screenshots/notification.png">
    <img src="https://raw.github.com/simplinx-ltd/node-log-notify/master/docs/screenshots/notification.png?raw=true" width="350" alt="Notifications" title="Notification">
  </a>
</p>

#### Resources (Memory and CPU) Page
<p align="center">
  <a href="docs/screenshots/resource-memory.png" target="_blank">
    <img src="https://raw.github.com/simplinx-ltd/node-log-notify/master/docs/screenshots/resource-memory.png?raw=true" width="350" title="Resource Memory" alt="Resource Memory">
  </a>
  <a href="docs/screenshots/resource-cpu.png">
    <img src="https://raw.github.com/simplinx-ltd/node-log-notify/master/docs/screenshots/resource-cpu.png?raw=true" width="350" alt="Resource CPU" title="Resource CPU">
  </a>
</p>
</div>

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

### Database
Node Log Notify uses SQLiteDB by default config. If you want to connect a MySQL Database you can change db config as like follows in your config file that is your extracted.

```
"db": {
		"dialect": "mysql",
		"host": "localhost",
		"database": "node-log-notify",
		"username": "node-log-notify",
		"password": "node-log-notify",
		"logging": false,
		"port": 3306
	}
```
## License
MIT


#### [SimpLinx](https://www.simplinx.com)
