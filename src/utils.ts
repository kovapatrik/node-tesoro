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

function inputBufferToData(input: Buffer) {
    const data = input.toJSON().data;

    switch (data[1]) {
        case 3:
            return {'_id': data[6]};
        case 4:
            return {'effect': data[7]}
        case 12:
            return {'effect_color': data[2]};
        case 13:
            return {'brightness': data[2]};
    }
}

export {
    packetToByteArray,
    inputBufferToData
} 