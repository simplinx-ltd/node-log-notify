import * as fs from 'fs';
import configTemplate from './config-template';
import { IConfig } from './config-type';

let config: IConfig = null;

export function load(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.readFile(filePath, (err, content) => {
            if (err)
                return reject(err);

            try {
                config = JSON.parse(content.toString());
                return resolve(true);
            } catch (e) {
                config = null;
                return reject(e);
            }
        });
    });
}

export function get(): IConfig {
    return config;
}

export function extractConfigTemplateAsFile(filePath: string) {
    fs.writeFileSync(filePath, configTemplate);
}