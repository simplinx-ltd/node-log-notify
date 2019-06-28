import * as assert from 'assert';
import * as log4js from 'log4js';
import { ChildProcess } from 'child_process';
const logger = log4js.getLogger('PROCESS-AGENT');

const LOG_ARCHIVE_LENGTH = 41;  // lineCount2RecordBefore:  Max 20 , lineCount2RecordAfter:  Max 20

export enum When {
    immediately = 'immediately',
    daily = 'daily',
    all = 'all'
};

export interface IProcess {
    name: string;
    processManagerType: 'pm2';
    process2Watch: string;
    notifyOnRestart: {
        enable: boolean;
        when2Notify: When;
        maxMessagePerDay: number;
        includeInDailyReport: boolean;
    };
    notifyOnFailure: {
        enable: boolean;
        when2Notify: When;
        maxMessagePerDay: number;
        includeInDailyReport: boolean;
    };
    logWatchList: ILogWatch[];
};

interface ILogWatch {
    text2Watch: string;
    lineCount2RecordBefore: number;  // How many lines before text2Watch found will be recorded ( & send by email)
    lineCount2RecordAfter: number;   // How many lines after text2Watch found will be recorded ( & send by email)
    when2Notify: When;
    maxMessagePerDay: number;
    includeInDailyReport: boolean;
    mailOptions: {
        messagePrefix: string;
        subject: string;
    };
};

export interface INotification {
    processName: string;
    text2Watch: string | null;
    type: 'log-notify' | 'restart' | 'failure';
    to: string;
    from: string;
    subject: string;
    when2Notify: When;
    includeInDailyReport: boolean;
    maxMessagePerDay: number;
    message: string;
};

export interface IProcessInfo {
    status: string;
    restartCount: number;
    memory: number;
    cpu: number;
    notification?: INotification
};

export abstract class ProcessAgent {
    protected PROCESS_INFO_UPDATE_CYCLE = 30 * 1000;
    protected processConfig: IProcess = null;
    protected newNotificationCb: (notification: INotification) => void = null;
    protected newProcessInfoCb: (info: IProcessInfo) => void = null;
    protected logListenerApp: ChildProcess = null;
    protected logArchieve: {
        text: string;
        timestamp: string;
    }[] = [];
    protected totalLogLineCount: number = 0;
    protected lastCreatedNotification: {
        [text2Watch: string]: number
    } = {};

    constructor(processConfig: IProcess,
        newNotificationCb: (values: any) => void,
        newProcessInfoCb: (info: IProcessInfo) => void) {
        assert(processConfig, 'Needed Parameter');
        assert(newNotificationCb, 'Needed Parameter');
        assert(newProcessInfoCb, 'Needed Parameter');

        this.processConfig = processConfig;
        this.newNotificationCb = newNotificationCb;
        this.newProcessInfoCb = newProcessInfoCb;
    }

    protected abstract watchProcessLogOutput(): void;
    protected abstract watchProcessInfo(): void;

    start() {
        this.watchProcessLogOutput();
        this.watchProcessInfo();
    }

    protected newLogLine(logLine: string, timestamp: string) {
        this.archieveLogLine(logLine, timestamp);
        this.processLogLine(); // Process 21. log-line Item
    }

    protected newProcessInfo(info: IProcessInfo) {
        this.newProcessInfoCb(info);
    }

    protected archieveLogLine(text: string, timestamp: string) {
        if (this.logArchieve.length >= LOG_ARCHIVE_LENGTH)
            this.logArchieve.pop();
        this.logArchieve.unshift({ text, timestamp });
        logger.trace(`Adding new log line: '${timestamp}' : '${text}'`);
    }

    protected processLogLine() {
        const logLineIndex = Math.round(LOG_ARCHIVE_LENGTH / 2) - 1;
        let logLine = this.logArchieve[logLineIndex];

        // Not filled yet
        if (!logLine)
            return;

        this.totalLogLineCount++;

        for (let i = 0; i < this.processConfig.logWatchList.length; i++) {
            // If we found text &&
            // We didn't send it as a part of prev notification (see->lineCount2RecordAfter)
            if (logLine.text.toLowerCase().indexOf(this.processConfig.logWatchList[i].text2Watch.toLowerCase()) >= 0 &&
                (this.totalLogLineCount > ((this.lastCreatedNotification[this.processConfig.logWatchList[i].text2Watch] || 0) + this.processConfig.logWatchList[i].lineCount2RecordAfter))) {
                let foundLogWatch = this.processConfig.logWatchList[i];
                this.lastCreatedNotification[foundLogWatch.text2Watch] = this.totalLogLineCount;
                logger.info(`Creating new notification...`);
                logger.info(`text2Watch: ${foundLogWatch.text2Watch}`);

                let message: string = `
                <h5>Notification Message - Node-Log-Notify </h5>
                <hr/>
                <p>
                    <b>Message: </b> ${foundLogWatch.mailOptions.messagePrefix} <br/>
                    <b>text2Watch: </b> ${foundLogWatch.text2Watch} <br/>
                    <b>lineCount2RecordBefore: </b> ${foundLogWatch.lineCount2RecordBefore} <br/>
                    <b>lineCount2RecordAfter: </b> ${foundLogWatch.lineCount2RecordAfter} <br/>
                    <br/>
                    <br/>                
                </p>   
                <h5>------  LOGS  ------ </h5>
                <hr/>
                <p>             
                `;

                let maxLineCount = Math.round(LOG_ARCHIVE_LENGTH / 2) - 1;
                let lineCount2RecordBefore = (foundLogWatch.lineCount2RecordBefore || 1) > maxLineCount ? maxLineCount : foundLogWatch.lineCount2RecordBefore || 1;
                let lineCount2RecordAfter = (foundLogWatch.lineCount2RecordAfter || 1) > maxLineCount ? maxLineCount : foundLogWatch.lineCount2RecordAfter || 1;
                for (let j = logLineIndex + lineCount2RecordBefore; j > logLineIndex; j--) {
                    message += `${this.logArchieve[j].text || '-'} <br/>`;
                }
                message += `<b>${this.logArchieve[logLineIndex].text} </b><br/>`;
                for (let j = logLineIndex - 1; j >= logLineIndex - lineCount2RecordAfter; j--) {
                    message += `${this.logArchieve[j].text} <br/>`;
                }

                // Strip '\n'
                message.replace(/(\r\n|\n|\r)/gm, '');

                this.newNotificationCb({
                    processName: this.processConfig.name,
                    text2Watch: foundLogWatch.text2Watch,
                    type: 'log-notify',
                    from: null,
                    to: null,
                    subject: foundLogWatch.mailOptions.subject,
                    message: message,
                    when2Notify: foundLogWatch.when2Notify,
                    includeInDailyReport: foundLogWatch.includeInDailyReport,
                    maxMessagePerDay: foundLogWatch.maxMessagePerDay
                });
            }
        }
    }
}