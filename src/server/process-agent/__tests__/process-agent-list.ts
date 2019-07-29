import { mocked } from 'ts-jest/utils';

import { create } from '../process-agent-list';
import { Process } from '../process-agent';
import Pm2Agent from '../pm2-agent';

jest.mock('../pm2-agent');
jest.mock('../process-agent');

const mockedPm2Agent = mocked(Pm2Agent, false);

describe('ProcessAgentList', (): void => {
    test('create Function Creates processAgent Thats Type pm2', (): void => {
        let processAgent = create(({ processManagerType: 'pm2' } as unknown) as Process, null, null, null, null, null);

        expect(processAgent).toBeInstanceOf(Pm2Agent);
        expect(mockedPm2Agent.mock.calls.length).toBe(1);
    });

    test('Should Return null If create Function Called without processManagerType', (): void => {
        let processAgent = create(({} as unknown) as Process, null, null, null, null, null);

        expect(processAgent).toBeNull();
        expect(mockedPm2Agent).not.toBeCalled();
    });
});
