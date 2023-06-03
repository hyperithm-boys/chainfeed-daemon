export function filterField<T extends { block_number: number }, K extends keyof T>(values: T[], ...additionalFields: K[]): [any, any][] {
    return values.map(x => {
        const { ...obj } = x;
        additionalFields.forEach(prop => {
            delete obj[prop];
        })
        return [obj, x];
    })
}
