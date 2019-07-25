import { ProcessAgent, ProcessInfo, ProcessStatus } from './process-agent';
import { spawn, exec } from 'child_process';
import * as log4js from 'log4js';
const logger = log4js.getLogger('PROCESS-AGENT-PM2');

export default class Pm2Agent extends ProcessAgent {
    protected watchProcessLogOutput(): void {
        logger.trace('watchProcessLogOutput() called');
        this.logListenerApp = spawn('pm2', ['logs', this.processConfig.process2Watch, '--json'], { detached: false });

        this.logListenerApp.stdout.on('data', (data): void => {
            let divByNewLine: string[] = data.toString().split('\n');
            for (let i = 0; i < divByNewLine.length; i++) {
                try {
                    let log = JSON.parse(divByNewLine[i]);
                    if (log && log.message && log.timestamp) this.newLogLine(log.message, log.timestamp);
                } catch (e) {}
            }
        });

        this.logListenerApp.on('exit', (code): void => {
            logger.error(`pm2 logs listener app exited with code ${code}`);
        });

        this.logListenerApp.on('error', (err): void => {
            logger.error(`pm2 logs listener app error:`);
            logger.error(err);
        });
    }

    protected watchProcessInfo(): void {
        // Restart Count: pm2_env.restart_time
        // Status: pm2_env.status ['online','stopped' ... ]
        // Memory: monit.memory (byte)
        // CPU: monit.cpu (%)

        setInterval((): void => {
            logger.trace('watchProcessInfo() called');
            exec(`pm2 jlist`, (err, stdout): void => {
                if (err) return logger.error(err);

                try {
                    let pList = JSON.parse(stdout);
                    for (let i = 0; i < pList.length; i++) {
                        if (pList[i].name == this.processConfig.process2Watch) {
                            let info: ProcessInfo = {
                                status: this.convertStatusFromStr(pList[i].pm2_env.status),
                                restartCount: pList[i].pm2_env.restart_time,
                                memory: pList[i].monit.memory,
                                cpu: pList[i].monit.cpu,
                            };

                            logger.trace('Parsing new process-info: ', info);
                            this.processProcessInfo(info);
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

    protected convertStatusFromStr(strStatus: string): ProcessStatus {
        switch (strStatus) {
            case 'online':
                return ProcessStatus.Online;
            case 'stopped':
                return ProcessStatus.Offline;
            case 'failed':
                return ProcessStatus.Failure;
            default:
                return ProcessStatus.UnKnown;
        }
    }
}
