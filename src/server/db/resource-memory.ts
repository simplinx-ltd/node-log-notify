import ResourceMemory from './models/resource-memory';

export function createResourceMemory(
    timestamp: Date,
    process: string,
    value: number
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        ResourceMemory.create({
            timestamp,
            process,
            value
        })
            .then(() => {
                return resolve(true);
            })
            .catch((e) => {
                return reject(e);
            });
    });
}