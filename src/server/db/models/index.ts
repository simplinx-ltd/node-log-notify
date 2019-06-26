import { Sequelize, } from 'sequelize-typescript';
import { Op } from 'sequelize';
import notification from './notification';
import resourceMemory from './resource-memory';
import resourceCpu from './resource-cpu';

export default function defineModels(dbConnection: Sequelize) {
    dbConnection.addModels([notification, resourceCpu, resourceMemory]);
    dbConnection.sync();
}