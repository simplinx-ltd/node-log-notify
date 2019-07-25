import { mocked } from 'ts-jest/utils';

import { create } from '../process-agent-list';
import { Process, ProcessAgent } from '../process-agent';
import Pm2Agent from '../pm2-agent';

jest.mock('../pm2-agent');
jest.mock('../process-agent');

const mockedPm2Agent = mocked(Pm2Agent, false);

let testProcDataTrue: Process = {
    name: 'process',
    processManagerType: 'pm2',
    process2Watch: 'app-1',
    notifyOnRestart: null,
    notifyOnFailure: null,
    logWatchList: null,
};

let testProcDataNull = {
    processManagerType: 'test',
};

describe('Test ProcessAgentList', (): void => {
    test('Calls create Function with processManagerType that name is pm2', (): void => {
        mockedPm2Agent.mockReturnValue(null);
        create(testProcDataTrue, null, null, null, null, null);
        //start();?
        expect(mockedPm2Agent.mock.calls.length).toBe(1);
        expect(mockedPm2Agent).toBeCalledWith(testProcDataTrue, null, null, null, null, null);
    });

    test('Calls create Function without processManagerType Name and Expects null', (): void => {
        let agentList = create(testProcDataNull as Process, null, null, null, null, null);
        expect(agentList).toBeNull();
    });
});
