/**
 * 迭代器：具有 next 方法的对象，每次调用 next 返回一个结果对象，该对象有 value 和 done 两个属性值，
 *         value：当前的值
 *         done： 遍历是否结束
 */
// 实现一个迭代器
function createIterator(items) {
    var i = 0;
    return {
        next: function () {
            var done = i >= items.length;
            var value = done ? undefined : items[i++];

            return {
                value: value,
                done: done
            }
        }
    };
}

// 一些默认部署了Symbol.iterator属性的对象：
// 数组
// Set
// Map
// 字符串
// 类数组对象，如：arguments, DOM NodeList
// Generate 对象

// 模拟实现for of
function forOf(obj, cb) {
    var iterator, result;

    if (typeof obj[Symbol.iterator] !== 'function') {
        throw new TypeError('obj is not iterable');
    }
    if (typeof cb !== 'function') {
        throw new TypeError('cb must be callable');
    }

    iterator = obj[Symbol.iterator]();
    result = iterator.next();

    while (!result.done) {
        cb(result.value);
        result = iterator.next();
    }
}