import ResourceCpu from './models/resource-cpu';

export function createResourceCpu(
    timestamp: Date,
    process: string,
    value: number
): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        ResourceCpu.create({
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