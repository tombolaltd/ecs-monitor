export function chunk(arr, n) {
    let tempArray = [];
    const arrayLength = arr.length;
    
    for (let index = 0; index < arrayLength; index += n) {
        const thisChunk = arr.slice(index, index + n);
        tempArray.push(thisChunk);
    }

    return tempArray;
}

export function flatten(arr) {
    return [].concat.apply([], arr);
}