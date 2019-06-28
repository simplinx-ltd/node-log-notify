import { ProcessAgent, IProcessInfo } from "./process-agent";
import { spawn, exec } from "child_process";
import * as log4js from 'log4js';
const logger = log4js.getLogger('PROCESS-AGENT-PM2');

export default class Pm2Agent extends ProcessAgent {

    protected watchProcessLogOutput() {
        logger.trace('watchProcessLogOutput() called');

        this.logListenerApp = spawn('pm2', ['logs', this.processConfig.process2Watch, '--json'], { detached: false });

        this.logListenerApp.stdout.on('data', (data) => {
            let divByNewLine: string[] = data.toString().split('\n');
            for (let i = 0; i < divByNewLine.length; i++) {
                try {
                    let log = JSON.parse(divByNewLine[i]);
                    if (log && log.message && log.timestamp)
                        this.newLogLine(log.message, log.timestamp);
                } catch (e) { }
            }
        });

        this.logListenerApp.on('exit', (code) => {
            logger.error(`pm2 logs listener app exited with code ${code}`);
        });

        this.logListenerApp.on('error', (err) => {
            logger.error(`pm2 logs listener app error:`);
            logger.error(err);
        });
    }

    protected watchProcessInfo() {
        // Restart Count: pm2_env.restart_time
        // Status: pm2_env.status ['online','stopped' ... ]
        // Memory: monit.memory (byte)
        // CPU: monit.cpu (%)

        let prevStatus = 'online';
        let prevRestartCount = 1000 * 1000; // big number
        let isFailureMessageSent: boolean = false;
        setInterval(() => {
            logger.trace('watchProcessInfo() called');
            exec(`pm2 jlist`, (err, stdout, stderr) => {
                if (err)
                    return logger.error(err);

                try {
                    let pList = JSON.parse(stdout);
                    for (let i = 0; i < pList.length; i++) {
                        if (pList[i].name == this.processConfig.process2Watch) {
                            let info: IProcessInfo = {
                                status: pList[i].pm2_env.status,
                                restartCount: pList[i].pm2_env.restart_time,
                                memory: pList[i].monit.memory,
                                cpu: pList[i].monit.cpu
                            };

                            if (this.processConfig.notifyOnRestart.enable &&
                                prevRestartCount < pList[i].pm2_env.restart_time) {
                                logger.info(`${this.processConfig.name}: Process restart detected. Creating notification.`);
                                info.notification = {
                                    processName: this.processConfig.name,
                                    text2Watch: null,
                                    type: 'restart',
                                    from: null,     // Will be filled with default
                                    to: null,       // Will be filled with default
                                    subject: null,  // Will be filled with default
                                    when2Notify: this.processConfig.notifyOnRestart.when2Notify,
                                    includeInDailyReport: this.processConfig.notifyOnRestart.includeInDailyReport,
                                    maxMessagePerDay: this.processConfig.notifyOnRestart.maxMessagePerDay,
                                    message: `${new Date().toUTCString()}: ${this.processConfig.name} restarted ${pList[i].pm2_env.restart_time - prevRestartCount} times in 10 sec.`
                                };
                            }

                            if (this.processConfig.notifyOnFailure.enable &&
                                !isFailureMessageSent &&
                                prevStatus !== 'online' &&
                                prevStatus == pList[i].pm2_env.status &&
                                prevRestartCount == pList[i].pm2_env.restart_time) {
                                logger.info(`${this.processConfig.name}: Process failure detected. Creating notification.`);
                                info.notification = {
                                    processName: this.processConfig.name,
                                    text2Watch: null,
                                    type: 'failure',
                                    from: null,     // Will be filled with default
                                    to: null,       // Will be filled with default
                                    subject: null,  // Will be filled with default
                                    when2Notify: this.processConfig.notifyOnFailure.when2Notify,
                                    includeInDailyReport: this.processConfig.notifyOnFailure.includeInDailyReport,
                                    maxMessagePerDay: this.processConfig.notifyOnFailure.maxMessagePerDay,
                                    message: `${new Date().toUTCString()}: ${this.processConfig.name} Failed`
                                };
                                isFailureMessageSent = true;
                            } else {
                                isFailureMessageSent = false;
                            }

                            logger.trace('Parsing new process-info: ', info);
                            this.newProcessInfo(info);

                            prevStatus = pList[i].pm2_env.status;
                            prevRestartCount = pList[i].pm2_env.restart_time;
                            break;
                        }
                    }

                } catch (e) {
                    logger.error('watchProcessInfo() Error:');
                    logger.error(e);
                }
            });
        }, this.PROCESS_INFO_UPDATE_CYCLE);

    }

}