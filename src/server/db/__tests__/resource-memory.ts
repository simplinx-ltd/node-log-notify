import { mocked } from 'ts-jest/utils';
import * as BlueBird from 'bluebird';
import { createResourceMemory } from '../resource-memory';
import ResourceMemory from '../models/resource-memory';

jest.mock('../models/resource-memory');

const mockedResourcesMemory = mocked(ResourceMemory, false);

beforeEach((): void => {
    mockedResourcesMemory.mockReset();
});

describe('ResourceMemory Model Operations', (): void => {
    describe('createResourceMemory', (): void => {
        test('Calls create function', (done): void => {
            let createVars = {timestamp: new Date(), process: 'Moderator', value: 1}; 
            mockedResourcesMemory.create.mockReturnValueOnce(BlueBird.resolve());
            createResourceMemory(createVars.timestamp, createVars.process, createVars.value).then((): void => {
                expect(mockedResourcesMemory.create.mock.calls.length).toBe(1);
                done();
            })
        });

        test('Rejects on error', (done): void => {
            let createVars = {timestamp: new Date(), process: 'Moderator', value: 1}; 
            mockedResourcesMemory.create.mockReturnValueOnce(BlueBird.reject('Reject Error'));
            createResourceMemory(createVars.timestamp, createVars.process, createVars.value).catch((e): void => {
                expect(mockedResourcesMemory.create.mock.calls.length).toBe(1);
                expect(e).toBe('Reject Error');
                done();
            });
        });
    });
});