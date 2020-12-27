function numArrayToHexString(arr : number[]) {
    let res = "";
    for (const h of arr) {
        res += String('00' + h.toString(16)).slice(-2);
    }
    return res
}

export {
    numArrayToHexString
} 