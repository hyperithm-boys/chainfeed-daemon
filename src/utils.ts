export function filterBlockField<T extends { block: number }>(values: T[]): Omit<T, "block">[] {
    return values.map(x => {
        const { block: _, ...rest } = x;
        return rest
    })
}
