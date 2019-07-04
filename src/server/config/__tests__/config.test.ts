import configTemplate from '../config-template';
import { extractConfigTemplateAsFile, get, load } from '../config';
import { unlinkSync, existsSync, writeFileSync } from 'fs';

const testFilePath = '/tmp/extractConfigTemplateAsFile.json';
const testFilePathNotExists = '/tmp/testFilePathNotExists.json';
const unparsableFilePath = '/tmp/unparsableFilePath.json';

describe('Config Extract, Load, Get operations', (): void => {
    test('Can extract config file', (): void => {
        expect((): void => {
            unlinkSync(testFilePath);
            extractConfigTemplateAsFile(testFilePath);
        }).not.toThrowError();

        expect(existsSync(testFilePath)).toBe(true);
    });

    test('Can load config file', (done): void => {
        unlinkSync(testFilePath);
        extractConfigTemplateAsFile(testFilePath);
        load(testFilePath).then((): void => {
            expect(get()).toEqual(JSON.parse(configTemplate));
            done();
        });
    });

    test('Will Reject if can not load config file', (done): void => {
        load(testFilePathNotExists).catch((): void => {
            expect(get()).toEqual(null);
            done();
        });
    });

    test('Will Reject if can not parse config file', (done): void => {
        writeFileSync(unparsableFilePath, 'Un-Parsable JSON');
        load(unparsableFilePath).catch((): void => {
            expect(get()).toEqual(null);
            done();
        });
    });
});
