/**
 * Math.max 可用于能转为数字类型的参数，但是遇到不能转为数字类型的会返回NaN，如：
 * Math.max(1, null); // 1
 * Math.max(1, undefined); // NaN
 * Math.max(1, {}); // NaN
 * Math.max(1, [1,2,3]); // NaN
 */
function arrMax1(array) {
    var result = array[0];
    for (var i = 1; i < array.length; i++) {
        if (array[i] > result) result = array[i];
    }
    return result;
}

function arrMax2(array) {
    var result = array[0];
    for (var i = 1; i < array.length; i++) {
        result = Math.max(result, array[i]);
    }
    return result;
}

function arrMax3(array) {
    return array.reduce((prev, cur) => {
        return Math.max(prev, cur);
    });
}

function arrMax4(array) {
    return array.sort((a, b) => a - b)[array.length - 1];
}

function arrMax5(array) {
    return eval(`Math.max(${array})`);
}

function arrMax6(array) {
    return Math.max.apply(null, array);
}

function arrMax7(array) {
    return Math.max(...array);
}

function arrMax8(array) {
    return Reflect.apply(Math.max, Math, array);
}