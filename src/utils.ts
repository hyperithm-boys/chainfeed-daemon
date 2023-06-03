export function splitBlockField<T extends { block: number }, K extends keyof Omit<T, "block">>(values: T[], ...additionalFields: K[]): [any, any][] {
    return values.map(x => {
        const { block: _, ...rest } = x;
        additionalFields.forEach(prop => {
            delete rest[prop];
        })
        return [rest, x];
    })
}
