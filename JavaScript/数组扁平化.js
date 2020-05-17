/**
 * var arr = [1, [2, [3, 4]], 5];
 * 思考如何将 arr 变成 [1, 2, 3, 4, 5]
 */

// 递归
function flatten1(array) {
    let res = [];
    array.forEach(item => {
        if (!Array.isArray(item)) {
            res.push(item);
        } else {
            res = res.concat(flatten1(item));
        }
    });
    return res;
}

// toString
function flatten2(array) {
    return array.toString().split(',').map(item => +item);
}

// reduce
function flatten3(array) {
    return array.reduce((prev, next) => {
        return prev.concat(Array.isArray(next) ? flatten3(next) : next);
    });
}

// ES6 ...
function flatten4(array) {
    let arr = array.concat(); // 复制一份数据，避免污染源数据
    while (arr.some(item => Array.isArray(item))) {
        arr = [].concat(...arr);
    }
    return arr;
}

/**
 * 模拟underscore实现
 * 数组扁平化
 * @param {Array} input 需要处理的数组
 * @param {Boolean} shallow 是否只扁平化一层
 * @param {Boolean} strict 是否严格处理元素
 * @param {Array} output 方便递归传递的参数
 */
function flatten5(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0; i < input.length; i++) {
        var value = input[i];
        if (Array.isArray(value)) {
            if (shallow) {
                var j = 0,
                    len = value.length;
                while (j < len) output[idx++] = value[j++];
            } else {
                flatten5(value, shallow, strict, output);
                idx = output.length;
            }
        } else if (!strict) {
            output.push(value);
        }
    }
    return output;
}
// var arr = [1, 2, 3, [4, 5, [6, 7]], [8, 9]];
// flatten5(arr, true, true); // [4, 5, [6, 7], 8, 9]


// Function.apply.bind([].concat, [])(array) 解释：
// 等价于 Function.apply.call([].concat, [], array) , 涉及到bind的原理实现，类比bind原理实现
// 等价于 [].concat.apply([], array)
// 等价于 [].concat(...array)
function flatten6(array) {
    return Function.apply.bind([].concat, [])(array);
}