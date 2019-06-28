import { SequelizeOptions } from 'sequelize-typescript';
import { Process } from '../process-agent/process-agent';

export interface Config {
    webOptions: {
        port: number;
        username: string;
        password: string;
    };
    db: SequelizeOptions;
    sendMailOptions: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeMailerTransportOptions: any; // see nodemailer.createTransport
        from: string;
        defaultTo: string;
        defaultSubject: string;
        sendDailyReport: boolean;
    };
    processList: Process[];
}
