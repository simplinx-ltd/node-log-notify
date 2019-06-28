import ResourceCpu from './models/resource-cpu';

export function createResourceCpu(timestamp: Date, process: string, value: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject): void => {
        ResourceCpu.create({
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
