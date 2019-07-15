import * as log4js from 'log4js';
import { ChildProcess } from 'child_process';
const logger = log4js.getLogger('PROCESS-AGENT');

const LOG_ARCHIVE_LENGTH = 41; // lineCount2RecordBefore:  Max 20 , lineCount2RecordAfter:  Max 20

export enum When {
    immediately = 'immediately',
    daily = 'daily',
    all = 'all',
}

export enum ProcessStatus {
    Online,
    Offline,
    Failure,
    UnKnown,
}

export interface Process {
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
    logWatchList: LogWatch[];
}

interface LogWatch {
    text2Watch: string;
    lineCount2RecordBefore: number; // How many lines before text2Watch found will be recorded ( & send by email)
    lineCount2RecordAfter: number; // How many lines after text2Watch found will be recorded ( & send by email)
    when2Notify: When;
    maxMessagePerDay: number;
    includeInDailyReport: boolean;
    mailOptions: {
        messagePrefix: string;
        subject: string;
    };
}

export interface Notification {
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
}

export interface ProcessInfo {
    status: ProcessStatus;
    restartCount: number;
    memory: number;
    cpu: number;
}

export abstract class ProcessAgent {
    protected PROCESS_INFO_UPDATE_CYCLE = 30 * 1000;
    protected processConfig: Process = null;
    protected logListenerApp: ChildProcess = null;
    protected logArchieve: {
        text: string;
        timestamp: string;
    }[] = [];
    protected totalLogLineCount: number = 0;
    protected lastCreatedNotification: {
        [text2Watch: string]: number;
    } = {};
    ///
    protected prevStatus = ProcessStatus.Online;
    protected prevRestartCount = 1000 * 1000; // big number
    protected isFailureMessageSent = false;

    ///
    private createResourceCpuCb: (timestamp: Date, process: string, value: number) => Promise<boolean>;
    private createResourceMemoryCb: (timestamp: Date, process: string, value: number) => Promise<boolean>;
    private createNotificationCb: (values: object) => Promise<boolean>;

    public constructor(
        processConfig: Process,
        createNotificationCb: (values: object) => Promise<boolean>,
        createResourceCpuCb: (timestamp: Date, process: string, value: number) => Promise<boolean>,
        createResourceMemoryCb: (timestamp: Date, process: string, value: number) => Promise<boolean>,
    ) {
        this.processConfig = processConfig;
        this.createNotificationCb = createNotificationCb;
        this.createResourceCpuCb = createResourceCpuCb;
        this.createResourceMemoryCb = createResourceMemoryCb;
    }

    protected abstract watchProcessLogOutput(): void;
    protected abstract watchProcessInfo(): void;
    protected abstract convertStatusFromStr(strStatus: string): ProcessStatus;

    public start(): void {
        this.watchProcessLogOutput();
        this.watchProcessInfo();
    }

    private getHeaderText(): string {
        return `<h5>Notification Message - Node-Log-Notify </h5>
        <hr/>`;
    }

    private getFooterText(): string {
        return `<hr/>`;
    }

    protected newLogLine(logLine: string, timestamp: string): void {
        this.archieveLogLine(logLine, timestamp);
        this.processLogLine(); // Process 21. log-line Item
    }

    protected archieveLogLine(text: string, timestamp: string): void {
        if (this.logArchieve.length >= LOG_ARCHIVE_LENGTH) this.logArchieve.pop();
        this.logArchieve.unshift({ text, timestamp });
        logger.trace(`Adding new log line: '${timestamp}' : '${text}'`);
    }

    protected processLogLine(): void {
        const logLineIndex = Math.round(LOG_ARCHIVE_LENGTH / 2) - 1;
        let logLine = this.logArchieve[logLineIndex];

        // Not filled yet
        if (!logLine) return;

        this.totalLogLineCount++;

        for (let i = 0; i < this.processConfig.logWatchList.length; i++) {
            // If we found text &&
            // We didn't send it as a part of prev notification (see->lineCount2RecordAfter)
            if (
                logLine.text.toLowerCase().indexOf(this.processConfig.logWatchList[i].text2Watch.toLowerCase()) >= 0 &&
                this.totalLogLineCount >
                    (this.lastCreatedNotification[this.processConfig.logWatchList[i].text2Watch] || 0) +
                        this.processConfig.logWatchList[i].lineCount2RecordAfter
            ) {
                let foundLogWatch = this.processConfig.logWatchList[i];
                this.lastCreatedNotification[foundLogWatch.text2Watch] = this.totalLogLineCount;
                logger.info(`Creating new notification...`);
                logger.info(`text2Watch: ${foundLogWatch.text2Watch}`);

                let message = `
                ${this.getHeaderText()}
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
                let lineCount2RecordBefore =
                    (foundLogWatch.lineCount2RecordBefore || 1) > maxLineCount
                        ? maxLineCount
                        : foundLogWatch.lineCount2RecordBefore || 1;
                let lineCount2RecordAfter =
                    (foundLogWatch.lineCount2RecordAfter || 1) > maxLineCount
                        ? maxLineCount
                        : foundLogWatch.lineCount2RecordAfter || 1;
                for (let j = logLineIndex + lineCount2RecordBefore; j > logLineIndex; j--) {
                    message += `${this.logArchieve[j].text || '-'} <br/>`;
                }
                message += `<b>${this.logArchieve[logLineIndex].text} </b><br/>`;
                for (let j = logLineIndex - 1; j >= logLineIndex - lineCount2RecordAfter; j--) {
                    message += `${this.logArchieve[j].text} <br/>`;
                }

                message += this.getFooterText();

                this.createNotificationCb({
                    processName: this.processConfig.name,
                    text2Watch: foundLogWatch.text2Watch,
                    type: 'log-notify',
                    from: null,
                    to: null,
                    subject: foundLogWatch.mailOptions.subject,
                    message: message,
                    when2Notify: foundLogWatch.when2Notify,
                    includeInDailyReport: foundLogWatch.includeInDailyReport,
                    maxMessagePerDay: foundLogWatch.maxMessagePerDay,
                });
            }
        }
    }

    protected processProcessInfo(info: ProcessInfo): void {
        let timestamp = new Date();
        this.createResourceCpuCb(timestamp, this.processConfig.name, info.cpu);
        this.createResourceMemoryCb(timestamp, this.processConfig.name, info.memory);

        if (this.processConfig.notifyOnRestart.enable && this.prevRestartCount < info.restartCount) {
            logger.info(`${this.processConfig.name}: Process restart detected. Creating notification.`);
            let notification: Notification = {
                processName: this.processConfig.name,
                text2Watch: null,
                type: 'restart',
                from: null, // Will be filled with default
                to: null, // Will be filled with default
                subject: null, // Will be filled with default
                when2Notify: this.processConfig.notifyOnRestart.when2Notify,
                includeInDailyReport: this.processConfig.notifyOnRestart.includeInDailyReport,
                maxMessagePerDay: this.processConfig.notifyOnRestart.maxMessagePerDay,
                message: `
                ${this.getHeaderText()}
                ${new Date().toUTCString()}: ${this.processConfig.name} restarted ${info.restartCount -
                    this.prevRestartCount} times in ${this.PROCESS_INFO_UPDATE_CYCLE / 1000} sec.
                `,
            };

            // Add Whole Log
            notification.message += `
            <br/>
            <br/>
            <h5>------  LOGS  ------ </h5>
            <hr/>
            <p>   `;
            for (let i = this.logArchieve.length; i >= 0; i--)
                notification.message += `${this.logArchieve[i].text} <br/>`;
            notification.message += '</p>';
            notification.message += this.getFooterText();

            this.createNotificationCb(notification);
        }

        if (
            this.processConfig.notifyOnFailure.enable &&
            !this.isFailureMessageSent &&
            this.prevStatus !== ProcessStatus.Online &&
            this.prevStatus == info.status &&
            this.prevRestartCount == info.restartCount
        ) {
            logger.info(`${this.processConfig.name}: Process failure detected. Creating notification.`);
            let notification: Notification = {
                processName: this.processConfig.name,
                text2Watch: null,
                type: 'failure',
                from: null, // Will be filled with default
                to: null, // Will be filled with default
                subject: null, // Will be filled with default
                when2Notify: this.processConfig.notifyOnFailure.when2Notify,
                includeInDailyReport: this.processConfig.notifyOnFailure.includeInDailyReport,
                maxMessagePerDay: this.processConfig.notifyOnFailure.maxMessagePerDay,
                message: `
                ${this.getHeaderText()}
                ${new Date().toUTCString()}: ${this.processConfig.name} Failed
                `,
            };

            // Add Whole Log
            notification.message += `
             <br/>
             <br/>
             <h5>------  LOGS  ------ </h5>
             <hr/>
             <p>   `;
            for (let i = this.logArchieve.length; i >= 0; i--)
                notification.message += `${this.logArchieve[i].text} <br/>`;
            notification.message += '</p>';
            notification.message += this.getFooterText();

            this.isFailureMessageSent = true;
            this.createNotificationCb(notification);
        } else {
            this.isFailureMessageSent = false;
        }

        this.prevStatus = info.status;
        this.prevRestartCount = info.restartCount;
    }
}
