import { Sequelize } from 'sequelize-typescript';
import notification from './notification';
import resourceMemory from './resource-memory';
import resourceCpu from './resource-cpu';

export default function defineModels(dbConnection: Sequelize): void {
    dbConnection.addModels([notification, resourceCpu, resourceMemory]);
    dbConnection.sync();
}
