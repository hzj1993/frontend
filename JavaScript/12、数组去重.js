// 说到数组去重，简单的就是想到indexOf方法，由此可以实现一个简单版的unique函数
// indexOf底层用的是===，如果数组内有多个NaN，NaN不去重
// 第一版
function unique1(array) {
    var result = [], value;
    for (var i = 0; i < array.length; i++) {
        value = array[i];
        if (result.indexOf(value) === -1) {
            result.push(value);
        }
    }
    return result;
}

// 将数组排序后去重
// 第二版
function unique2(array) {
    // 注意：sort()在不传入参数时，会调用每个元素的toString()转成字符串，然后比较字符串大小进行排序
    // 如：[2, 2, 15, 1, 5].sort() 得到 [1, 15, 2, 2, 5]
    // array.concat()为array创建了一份副本，sort()排序后不污染原数据
    var arr = array.concat().sort(),
        result = [],
        res;
    for (var i = 0; i < arr.length; i++) {
        // 如果当前是第一个元素 或者 前一个元素不等于当前元素
        if (i === 0 || res !== arr[i]) {
            result.push(arr[i]);
        }
        res = arr[i];
    }
    return result;
}

// 再优化一下...
// 每轮循环都由外部函数iteratee处理数据，内部再根据iteratee处理好的数据做比较
// 同时，再加上isSorted参数说明传入的数组是否已经排好序，如果已经排好序，则用速度更快的第二版实现的方法
// 以下也是仿照underscore实现的unique方法
function unique3(array, isSorted, iteratee) {
    var result = [], seen = [];
    for (var i = 0; i < array.length; i++) {
        var value = array[i],
            computed = iteratee ? iteratee(value, i, array) : value;
        if (isSorted) {
            var val = iteratee ? computed : value;
            if (i === 0 || seen !== val) {
                result.push(value);
            }
            seen = val;
        } else if (iteratee) {
            if (seen.indexOf(computed) === -1) {
                seen.push(computed);
                result.push(value);
            }
        } else if (result.indexOf(value) === -1) {
            result.push(value);
        }
    }
    return result;
}

// unique3([{a: 1}, {a: 1}, {a: 2}], true, function (item, index, array) {
//     return item.a;
// });


// 其他方法
// ES6 filter
function unique4(array) {
    return array.filter(function (item, index, array) {
        return array.indexOf(item) === index;
    });
}

// es6 排序去重
function unique5(array) {
    return array.concat().sort().filter(function (item, index, arr) {
        return !index || arr[index - 1] !== item;
    });
}

// object键值对
function unique6(array) {
    var map = {},
        result = [];
    for (var i = 0; i < array.length; i++) {
        var value = array[i],
            // typeof用于区分Number和String，Number和String用作对象的key时，取到的值是一样的
            // JSON.stringify用于区分对象
            // Object.prototype.toString是因为JSON.stringify(/a/)和JSON.stringify(/b/)返回的都为'{}'
            key = typeof value + JSON.stringify(value) + Object.prototype.toString.call(value);
        if (!map[key]) {
            result.push(value);
            map[key] = true;
        }
    }
    return result;
}

// ES6 Set
function unique7(array) {
    return Array.from(new Set(array));
}

