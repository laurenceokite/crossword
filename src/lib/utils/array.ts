export function resizeAndFill<T>(array: T[], length: number, getter: () => T) {
    if (array.length == length) {
        return;
    } 
    
    while (array.length > length) {
        array.pop();
    }

    while (array.length < length) {
        array.push(getter());
    }
}