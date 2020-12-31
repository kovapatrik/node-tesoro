function packetToByteArray(arr: (number | string | undefined)[]) {
    let res = "";
    for (const h of arr) {
        res += String('00' + h!.toString(16)).slice(-2);
    }
    return hexToBytes(res);
}

function hexToBytes(hex : string) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

export {
    packetToByteArray
} 