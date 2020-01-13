function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function generate_random_string_small_letters(string_length){
    let random_string = '';
    let random_ascii;
    for(let i = 0; i < string_length; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii)
    }
    return random_string
}

function isArraysContainSameElements(_arr1, _arr2) {

    if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length)
      return false;

    var arr1 = _arr1.concat().sort();
    var arr2 = _arr2.concat().sort();

    for (var i = 0; i < arr1.length; i++) {

        if (arr1[i] !== arr2[i])
            return false;

    }

    return true;

}

function log(messageString) {
    console.log("[LOG] "+messageString+"\n");
}

function error(messageString) {
    console.log("[ERROR] "+messageString+"\n");
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    isJson: isJson,
    generateRandomSmallLetters: generate_random_string_small_letters,
    isArraysContainSameElements: isArraysContainSameElements,
    log: log,
    error: error,
    getRandomInt: getRandomInt
}