import * as fs from 'fs';
import configTemplate from './config-template';
import { Config } from './config-type';

let config: Config = null;

export function load(filePath: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject): void => {
        fs.readFile(filePath, (err, content): void => {
            if (err) return reject(err);

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

export function get(): Config {
    return config;
}

export function extractConfigTemplateAsFile(filePath: string): void {
    fs.writeFileSync(filePath, configTemplate);
}
