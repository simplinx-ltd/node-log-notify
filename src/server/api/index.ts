import { Application } from 'express';
import { authLogin, authLogout, setUsernamePassword } from './auth';
import resourceCpu from './resource-cpu';
import { Sequelize } from 'sequelize-typescript';
import { IConfig } from '../config/config-type';

export default function (_configData: IConfig, app: Application, connection: Sequelize) {

  setUsernamePassword({ username: _configData.webOptions.username, password: _configData.webOptions.password });
  app.post('/api/auth/login', authLogin);
  app.post('/api/auth/logout', authLogout);

  app.use('/api/resource-cpu', resourceCpu(connection));
}
