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


## License
MIT


#### [SimpLinx](https://www.simplinx.com)