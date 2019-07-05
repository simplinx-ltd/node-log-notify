import configTemplate from '../config-template';

test('Exports config template string', (): void => {
    expect(configTemplate).toBeDefined();
    expect(typeof configTemplate).toEqual('string');
});

test('Config template string is a parsable JSON Object', (): void => {
    expect((): void => {
        JSON.parse(configTemplate);
    }).not.toThrowError();
});

test('Config template Object has certain members', (): void => {
    let obj = JSON.parse(configTemplate);
    expect(obj.webOptions).toBeDefined();
    expect(obj.db).toBeDefined();
    expect(obj.sendMailOptions).toBeDefined();
});
