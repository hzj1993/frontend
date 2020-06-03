function isArray(array) {
    if (Object.prototype.toString.call(array) === '[object Array]') {
        return true;
    } else {
        return Array.isArray(array);
    }
}

// 实现findIndex
function findIndex(array, predicate, context) {
    if (!isArray(array)) {
        throw new Error('当前传入的第一个参数不是数组！');
    }
    for (var i = 0; i < array.length; i++) {
        if (predicate.call(context, array[i], i, array)) return i;
    }
    return -1;
}

// findIndex([1, 2, 3, 4], function (item, index, array) {
//     return item === 3;
// }, this); // 2

/* ========================================================================================= */

// 实现findLastIndex
// 就是倒序实现findIndex
function findLastIndex(array, predicate, context) {
    if (!isArray(array)) {
        throw new Error('当前传入的第一个参数不是数组!');
    }
    for (var i = array.length - 1; i >= 0; i--) {
        if (predicate.call(context, array[i], i, array)) return i;
    }
    return -1;
}

// findLastIndex([1, 2, 3, 4], 4, function (item, index, array) {
//     return item === 4;
// }, this); // 3

/* ========================================================================================= */

// 动态创建findIndex和findLastIndex函数
function createIndexFinder1(dir) {
    return function (array, predicate, context) {
        if (!isArray(array)) {
            throw new Error('当前传入的第一个参数不是数组！');
        }
        var length = array.length,
            i = dir >= 0 ? 0 : length - 1;

        for (; i >= 0 && i < length; i += dir) {
            if (predicate.call(context, array[i], i, array)) return i;
        }
        return -1;
    }
}

// var findIndex = createIndexFinder(1);
// var findLastIndex = createIndexFinder(-1);

/* ========================================================================================= */

// 给定一个已排好序的数组array，和一个元素obj，查找obj在array中的下标
// 思路：二分查找
function sortedIndex1(array, obj) {
    var start = 0,
        end = array.length;
    while (start < end) {
        var mid = Math.floor((start + end) / 2);
        if (array[mid] < obj) start = mid + 1;
        else end = mid;
    }
    return end;
}

/* ========================================================================================= */

// 此时我们把array改成[{aa: 1}, {aa: 2}, {aa: 3}]，obj改成{aa: 1},函数改写为：
// cb函数为了给传入的iteratee函数绑定上当前的执行对象
function cb(fn, context) {
    // void 0等价于undefined，因为undefined有可能会被重写，所以用void 0
    if (context === void 0) return fn;
    return function () {
        fn.apply(context, arguments);
    };
}

function sortedIndex2(array, obj, iteratee, context) {
    var start = 0, end = array.length;
    iteratee = cb(iteratee, context);
    while (start < end) {
        var mid = Math.floor((start + end) / 2);
        if (iteratee.call(array[mid]) < iteratee.call(obj)) start = mid + 1;
        else end = mid;
    }
    return end;
}

// sortedIndex2([{aa: 1}, {aa: 2}, {aa: 3}], {aa: 1}, function (item) {
//     return item.aa;
// }, this); // 1

/* ========================================================================================= */

function createIndexFinder2(dir) {
    return function (array, item, idx) {
        var length = array.length,
            i = 0;

        // 判断条件是为了找出边界值
        // 如dir > 0，为顺序，就从i = 0开始，如果设置了idx，则设置为idx，如果idx < 0，则与length相加得到初始值
        // 如dir < 0,逆序，从array末尾开始，此时idx的值恒等于实际查找的数组长度length - 1
        // 同时如果传入的idx不是Number类型，就不进判断
        if (typeof idx === 'number') {
            if (dir > 0) {
                i = idx >= 0 ? idx : Math.max(idx + length, 0);
            } else {
                length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
            }
        }

        for (idx = dir > 0 ? i : length - 1; 0 <= idx && idx < length; idx += dir) {
            if (array[idx] === item) return idx;
        }
        return -1;
    };
}

// 假设我现在要在上面的基础上实现类似这样的功能： [1, NaN].indexOf(NaN)，实现如下：
function createIndexFinder3(dir, predicate) {
    return function (array, item, idx) {
        var length = array.length,
            i = 0;

        // 判断条件是为了找出边界值
        // 如dir > 0，为顺序，就从i = 0开始，如果设置了idx，则设置为idx，如果idx < 0，则与length相加得到初始值
        // 如dir < 0,逆序，从array末尾开始，此时idx的值恒等于实际查找的数组长度length - 1
        // 同时如果传入的idx不是Number类型，就不进判断
        if (typeof idx === 'number') {
            if (dir > 0) {
                i = idx >= 0 ? idx : Math.max(idx + length, 0);
            } else {
                length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
            }
        }

        // 此处如果item是NaN，就会进入这个判断条件，因为NaN === NaN为false
        if (item !== item) {
            idx = predicate(array.slice(i, length), isNaN);

            // 由于得到idx的值是在array.slice(i, length)这个返回的子数组里面，所以最终对应到array的下标为idx + i
            return idx > -1 ? idx + i : -1;
        }

        for (idx = dir > 0 ? i : length - 1; 0 <= idx && idx < length; idx += dir) {
            if (array[idx] === item) return idx;
        }
        return -1;
    };
}
// var indexOf = createIndexFinder3(1, findIndex);
// var lastIndexOf = createIndexFinder3(-1, findLastIndex);


// 再度优化，我们可以这样传入indexOf([1, 2, 3], 2, true)
// 第三个参数不传具体的下标，传true，默认我传入的数组为已经排序好的数组，内部实现就可以采用速度更快的二分查找
// createIndexFinder4即为underscore源码实现
function createIndexFinder4(dir, predicate, sortedIndex) {
    return function (array, item, idx) {
        var length = array.length,
            i = 0;

        // 判断条件是为了找出边界值
        // 如dir > 0，为顺序，就从i = 0开始，如果设置了idx，则设置为idx，如果idx < 0，则与length相加得到初始值
        // 如dir < 0,逆序，从array末尾开始，此时idx的值恒等于实际查找的数组长度length - 1
        // 同时如果传入的idx不是Number类型，就不进判断
        if (typeof idx === 'number') {
            if (dir > 0) {
                i = idx >= 0 ? idx : Math.max(idx + length, 0);
            } else {
                length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
            }
        }
        // 二分查找优化在这里！！
        else if (sortedIndex && idx && length) {
            idx = sortedIndex1(array, item);
            return array[idx] === item ? idx : -1;
        }

        // 此处如果item是NaN，就会进入这个判断条件，因为NaN === NaN为false
        if (item !== item) {
            idx = predicate(array.slice(i, length), isNaN);

            // 由于得到idx的值是在array.slice(i, length)这个返回的子数组里面，所以最终对应到array的下标为idx + i
            return idx > -1 ? idx + i : -1;
        }

        for (idx = dir > 0 ? i : length - 1; 0 <= idx && idx < length; idx += dir) {
            if (array[idx] === item) return idx;
        }
        return -1;
    };
}
// var indexOf = createIndexFinder4(1, findIndex, sortedIndex1);
// var lastIndexOf = createIndexFinder4(-1, findLastIndex);