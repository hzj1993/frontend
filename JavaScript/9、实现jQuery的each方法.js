// each方法可遍历数组、类数组以及对象
// 调用形式如下：
// $.each(array, function (item, index, array) {
//     ...do something
// });
// arr可以是多种形式，如：
// var arr = [1, 2, 3, 4, 5];
// var arr = {0: 'aa', 1: 'bb', length: 2};
// var arr = {key1: 'value1', key2: 'value2'};
// 实现如下：
function each(obj, iteratee) {
    if (obj == null || typeof obj !== 'object') {
        throw new Error('传入的obj不是对象类型或者数组类型！');
    }
    // isArrayLike参考【8、类型判断.js】内实现
    if (isArrayLike(obj)) {
        for (var i = 0; i < obj.length; i++) {
            // 如果传入的函数return false，则跳出循环
            if (iteratee.call(obj[i], i, obj[i]) === false) break;
        }
    } else {
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 如果传入的函数return false，则跳出循环
                if (iteratee.call(obj[key], key, obj[key]) === false) break;
            }
        }
    }
}