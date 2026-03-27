function bytesToBinary(bytes: Uint8Array) {
    let binary = '';

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return binary;
}

function binaryToBytes(binary: string) {
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
}

export function encodeTextToBase64(text: string) {
    const bytes = new TextEncoder().encode(text);

    return btoa(bytesToBinary(bytes));
}

export function decodeBase64ToText(base64: string) {
    const normalized = base64
        .trim()
        .replace(/^data:.*;base64,/, '')
        .replace(/\s+/g, '');
    const binary = atob(normalized);

    return new TextDecoder().decode(binaryToBytes(binary));
}
