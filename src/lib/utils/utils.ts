export function debounce<F extends (...args: any[]) => void>(
    func: F,
    ms: number,
): (...args: Parameters<F>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function(...args: Parameters<F>) {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => func(...args), ms);
    };
}
