import { ProcessAgent, Process } from './process-agent';
import Pm2Agent from './pm2-agent';
import * as log4js from 'log4js';
const logger = log4js.getLogger('PROCESS-AGENT-LIST');

let agentList: ProcessAgent[] = [];

export function create(
    processData: Process,
    createNotificationCb: (values: object) => Promise<boolean>,
    createResourceCpuCb: (timestamp: Date, process: string, value: number) => Promise<boolean>,
    createResourceMemoryCb: (timestamp: Date, process: string, value: number) => Promise<boolean>,
): ProcessAgent {
    switch (processData.processManagerType) {
        case 'pm2':
            return agentList[
                agentList.push(
                    new Pm2Agent(processData, createNotificationCb, createResourceCpuCb, createResourceMemoryCb),
                ) - 1
            ];
        default:
            logger.error(`Process Manager Type is not known: ${processData.processManagerType}`);
    }
    return null;
}
