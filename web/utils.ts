/**
 * Get a file as binary data.
 */
export const loadBinaryData = (url: string): Promise<Uint8Array> => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    const p = new Promise<Uint8Array>((resolve, reject) => {
        xhr.addEventListener('load', () => {
            if (xhr.status !== 200) {
                return reject(`Could not load: ${url}`);
            }
            const arrayBuffer = xhr.response;
            resolve(new Uint8Array(arrayBuffer));
        });
    });
    xhr.send(null);
    return p;
};
