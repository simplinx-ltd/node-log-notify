import { mocked } from 'ts-jest/utils';
import * as BlueBird from 'bluebird';
import { createResourceCpu } from '../resource-cpu';
import ResourceCpu from '../models/resource-cpu';

jest.mock('../models/resource-cpu');

const mockedResourcesCPU = mocked(ResourceCpu, false);

beforeEach((): void => {
    mockedResourcesCPU.mockReset();
});

describe('ResourceCPU Model Operations', (): void => {
    describe('createResourceCPU', (): void => {
        test('Calls create function', (done): void => {
            let createVars = {timestamp: new Date(), process: 'appz-1', value: 1}; 
            mockedResourcesCPU.create.mockReturnValueOnce(BlueBird.resolve());
            createResourceCpu(createVars.timestamp, createVars.process, createVars.value).then((): void => {
                expect(mockedResourcesCPU.create.mock.calls.length).toBe(1);
                done();
            })
        });

        test('Rejects on error', (done): void => {
            let createVars = {timestamp: new Date(), process: 'Moderator', value: 1}; 
            mockedResourcesCPU.create.mockReturnValueOnce(BlueBird.reject('Reject Error'));
            createResourceCpu(createVars.timestamp, createVars.process, createVars.value).catch((e): void => {
                expect(mockedResourcesCPU.create.mock.calls.length).toBe(1);
                expect(e).toBe('Reject Error');
                done();
            });
        });
    });
});