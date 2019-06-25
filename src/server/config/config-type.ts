import { SequelizeOptions } from 'sequelize-typescript';
import { IProcess } from "../process-agent/process-agent";

export interface IConfig {
    db: SequelizeOptions,
    sendMailOptions: {
        nodeMailerTransportOptions: any;    // see nodemailer.createTransport
        from: string;
        defaultTo: string;
        defaultSubject: string;
    },
    processList: IProcess[]
};