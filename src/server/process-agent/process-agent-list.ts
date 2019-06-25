import { ProcessAgent, IProcess, IProcessInfo, INotification } from "./process-agent";
import Pm2Agent from "./pm2-agent";
import * as log4js from 'log4js';
const logger = log4js.getLogger('PROCESS-AGENT-LIST');

let agentList: ProcessAgent[] = [];

export function create(processData: IProcess,
    newNotificationCb: (notification: INotification) => void,
    newProcessInfoCb: (info: IProcessInfo) => void) {
    switch (processData.processManagerType) {
        case 'pm2':
            return agentList[agentList.push(new Pm2Agent(processData, newNotificationCb, newProcessInfoCb)) - 1];
        default:
            logger.error(`Process Manager Type is not known: ${processData.processManagerType}`);
    }
    return null;
}