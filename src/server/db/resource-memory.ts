import ResourceMemory from './models/resource-memory';

export function createResourceMemory(timestamp: Date, process: string, value: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject): void => {
        ResourceMemory.create({
            timestamp,
            process,
            value,
        })
            .then((): void => {
                return resolve(true);
            })
            .catch((e): void => {
                return reject(e);
            });
    });
}
