import { Application } from 'express';
import { authLogin, authLogout, setUsernamePassword } from './auth';
import resourceCpu from './resource-cpu';
import { Sequelize } from 'sequelize-typescript';
import { Config } from '../config/config-type';
import resourceMemory from './resource-memory';
import notification from './notification';

export default function api(_configData: Config, app: Application, connection: Sequelize): void {
    setUsernamePassword({ username: _configData.webOptions.username, password: _configData.webOptions.password });

    app.post('/api/auth/login', authLogin);
    app.post('/api/auth/logout', authLogout);

    app.use('/api/resource-cpu', resourceCpu(connection));
    app.use('/api/resource-memory', resourceMemory(connection));
    app.use('/api/notification', notification(connection));
}
