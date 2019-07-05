import defineModels from '../index';

let dbConnection = {
    addModels: jest.fn(),
    sync: jest.fn(),
};
test('Exports define models function', (): void => {
    expect(typeof defineModels).toBe('function');
});

test('Defines models', (): void => {
    defineModels(dbConnection as any);
    expect(dbConnection.addModels.mock.calls.length).toBe(1);
    expect(Array.isArray(dbConnection.addModels.mock.calls[0][0])).toBeTruthy();
    expect(dbConnection.sync.mock.calls.length).toBe(1);
});
