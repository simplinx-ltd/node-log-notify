import { SequelizeOptions } from 'sequelize-typescript';
import { IProcess } from "../process-agent/process-agent";

export interface IConfig {
    webOptions: {
        port: number;
        username: string;
        password: string;
    };
    db: SequelizeOptions;
    sendMailOptions: {
        nodeMailerTransportOptions: any;    // see nodemailer.createTransport
        from: string;
        defaultTo: string;
        defaultSubject: string;
        sendDailyReport: boolean;
    };
    processList: IProcess[];
};