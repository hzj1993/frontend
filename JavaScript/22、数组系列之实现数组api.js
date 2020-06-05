/**
 * 主要实现 map、reduce、filter、splice、push、pop，排序算法已经在【16、探索v8排序源码】有过研究
 * 实现各种 api 是为了探索底层原理，看看底层是怎么实现的，规范又是如何，是怎么考虑边界场景，最终目的还是提升自己的编码能力
 *
 * 参考来源：
 * http://47.98.159.95/my_blog/js-array/006.html
 * https://tc39.es/ecma262/#sec-array.prototype.map
 * https://github.com/v8/v8/blob/ad82a40509c5b5b4680d4299c8f08d6c6d31af3c/src/js/array.js#L1132
 */

// ecma262规范中关于 map 的内容：
// Let O be ? ToObject(this value).
// Let len be ? LengthOfArrayLike(O).
//     If IsCallable(callbackfn) is false, throw a TypeError exception.
//     Let A be ? ArraySpeciesCreate(O, len).
//     Let k be 0.
// Repeat, while k < len,
//     Let Pk be ! ToString(k).
//     Let kPresent be ? HasProperty(O, Pk).
//     If kPresent is true, then
// Let kValue be ? Get(O, Pk).
//     Let mappedValue be ? Call(callbackfn, thisArg, « kValue, k, O »).
// Perform ? CreateDataPropertyOrThrow(A, Pk, mappedValue).
//     Set k to k + 1.
// Return A.
Array.prototype.map1 = function (callback, thisArg) {
    // 处理this为null或者undefined
    if (this === null || this === undefined) {
        throw new TypeError('Can not read "map1" of null or undefined');
    }
    // 规范中规定callback是function
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
        throw new TypeError('callback is not a function');
    }

    let O = Object(this);
    // 保证len为数字，且为正整数
    let len = O.length >>> 0;

    let A = new Array(len);
    let k = 0;
    while (k < len) {
        if (k in O) {
            let kValue = O[k];
            A[k] = callback.call(thisArg, kValue, k, O);
        }
        k++;
    }
    return A;
}
// v8源码如下：
function ArrayMap(f, receiver) {
    CHECK_OBJECT_COERCIBLE(this, "Array.prototype.map");

    // Pull out the length so that modifications to the length in the
    // loop will not affect the looping and side effects are visible.
    var array = TO_OBJECT(this);
    var length = TO_LENGTH(array.length);
    if (!IS_CALLABLE(f)) throw %make_type_error(kCalledNonCallable, f);
    var result = ArraySpeciesCreate(array, length);
    for (var i = 0; i < length; i++) {
        if (i in array) {
            var element = array[i];
            %CreateDataProperty(result, i, %_Call(f, receiver, element, i, array));
        }
    }
    return result;
}

/** ************************************************************************************************************** **/

// 规范中关于reduce内容：
// Let O be ? ToObject(this value).
// Let len be ? LengthOfArrayLike(O).
//     If IsCallable(callbackfn) is false, throw a TypeError exception.
//     If len is 0 and initialValue is not present, throw a TypeError exception.
//     Let k be 0.
// Let accumulator be undefined.
//     If initialValue is present, then
// Set accumulator to initialValue.
//     Else,
//     Let kPresent be false.
//     Repeat, while kPresent is false and k < len,
//     Let Pk be ! ToString(k).
//     Set kPresent to ? HasProperty(O, Pk).
//     If kPresent is true, then
// Set accumulator to ? Get(O, Pk).
//     Set k to k + 1.
// If kPresent is false, throw a TypeError exception.
//     Repeat, while k < len,
//     Let Pk be ! ToString(k).
//     Let kPresent be ? HasProperty(O, Pk).
//     If kPresent is true, then
// Let kValue be ? Get(O, Pk).
//     Set accumulator to ? Call(callbackfn, undefined, « accumulator, kValue, k, O »).
// Set k to k + 1.
// Return accumulator.
Array.prototype.reduce1 = function (callback, initialValue) {
    if (this === null || this === undefined) {
        throw new TypeError('can not read "reduce1" of null or undefined');
    }
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
        throw new TypeError(callback + ' is not a function');
    }
    let O = Object(this);
    let len = O.length >>> 0;
    if (len === 0 && initialValue === undefined) {
        throw new TypeError('array is empty and initialValue is not present');
    }
    let k = 0;
    let accumulator;
    if (initialValue !== undefined) {
        accumulator = initialValue;
    } else {
        let kPresent = false;
        for (; k < len; k++) {
            if (k in O) {
                kPresent = true;
                accumulator = O[k++];
                break;
            }
        }
        if (!kPresent) {
            throw new TypeError('array is empty');
        }
    }
    for (; k < len; k++) {
        if (k in O) {
            let kValue = O[k];
            accumulator = callback.call(undefined, accumulator, kValue, k, O);
        }
    }
    return accumulator;
}
// v8源码如下：
function InnerArrayReduce(callback, current, array, length, argumentsLength) {
    if (!IS_CALLABLE(callback)) {
        throw %make_type_error(kCalledNonCallable, callback);
    }

    var i = 0;
    find_initial: if (argumentsLength < 2) {
        for (; i < length; i++) {
            if (i in array) {
                current = array[i++];
                break find_initial;
            }
        }
        throw %make_type_error(kReduceNoInitial);
    }

    for (; i < length; i++) {
        if (i in array) {
            var element = array[i];
            current = callback(current, element, i, array);
        }
    }
    return current;
}
function ArrayReduce(callback, current) {
    CHECK_OBJECT_COERCIBLE(this, "Array.prototype.reduce");

    // Pull out the length so that modifications to the length in the
    // loop will not affect the looping and side effects are visible.
    var array = TO_OBJECT(this);
    var length = TO_LENGTH(array.length);
    return InnerArrayReduce(callback, current, array, length,
        arguments.length);
}

/** ************************************************************************************************************** **/

// splice 实现，稍微复杂一点
Array.prototype.splice1 = function (startIndex, deleteCount, ...addElements) {
    var argumentsLen = arguments.length;
    let array = Object(this);
    let deleteArr = new Array(deleteCount);
    var len = array.length;

    // 处理startIndex和deleteCount传值异常的问题
    startIndex = computeStartIndex(startIndex, len);
    deleteCount = computeDeleteCount(len, deleteCount, startIndex, argumentsLen);

    // 保存删除的元素
    sliceDeleteElements(array, startIndex, deleteCount, deleteArr);
    // 挪动剩余的元素，分情况挪动
    // 1、删除元素与增加元素的数量相同
    // 2、删除的元素多于添加的元素
    // 3、删除的元素少于添加的元素
    movePostElements(array, startIndex, len, deleteCount, addElements);

    // 将需要添加的元素添加到数组里面
    for (let i = 0; i < addElements.length; i++) {
        array[startIndex + i] = addElements[i];
    }
    // 更新数组长度
    array.length = len - deleteCount + addElements.length;

    return deleteArr;
}
function computeStartIndex(startIndex, len) {
    if (startIndex < 0) {
        return Math.max(len + startIndex, 0);
    }
    return Math.min(len, startIndex);
}
function computeDeleteCount(len, deleteCount, startIndex, argumentsLen) {
    if (argumentsLen === 1) return len - startIndex;
    if (deleteCount < 0) return 0;
    if (deleteCount > len - startIndex) return len - startIndex;
    return deleteCount;
}
function sliceDeleteElements(array, startIndex, deleteCount, deleteArr) {
    for (let i = 0; i < deleteCount; i++) {
        let index = startIndex + i;
        if (index in array) {
            deleteArr[i] = array[index];
        }
    }
}
function movePostElements(array, startIndex, len, deleteCount, addElements) {
    // 情况一：删除元素与增加元素的数量相同
    if (deleteCount === addElements.length) return;

    // 情况二：删除的元素多于添加的元素
    if (deleteCount > addElements.length) {
        for (let i = startIndex + deleteCount; i < len; i++) {
            let formIndex = i;
            let toIndex = i - (deleteCount - addElements.length);
            if (formIndex in array) {
                array[toIndex] = array[formIndex];
            } else {
                delete array[toIndex];
            }
        }
        // 删除后面多于的元素
        for (let i = len - 1; i >= len - (deleteCount - addElements.length); i--) {
            delete array[i];
        }
    }

    // 情况三：删除的元素少于添加的元素
    // 从后往前移动元素
    if (deleteCount < addElements.length) {
        for (let i = len - 1; i >= startIndex + deleteCount; i--) {
            let formIndex = i;
            let toIndex = i + (addElements.length - deleteCount);
            if (formIndex in array) {
                array[toIndex] = array[formIndex];
            } else {
                delete array[toIndex];
            }
        }
    }
}

/** ************************************************************************************************************** **/

// filter，规范如下：
// Let O be ? ToObject(this value).
// Let len be ? LengthOfArrayLike(O).
//     If IsCallable(callbackfn) is false, throw a TypeError exception.
//     Let A be ? ArraySpeciesCreate(O, 0).
//     Let k be 0.
// Let to be 0.
// Repeat, while k < len,
//     Let Pk be ! ToString(k).
//     Let kPresent be ? HasProperty(O, Pk).
//     If kPresent is true, then
// Let kValue be ? Get(O, Pk).
//     Let selected be ! ToBoolean(? Call(callbackfn, thisArg, « kValue, k, O »)).
// If selected is true, then
// Perform ? CreateDataPropertyOrThrow(A, ! ToString(to), kValue).
//     Set to to to + 1.
// Set k to k + 1.
// Return A.
Array.prototype.filter1 = function (callback, thisArg) {
    if (this === null || this === undefined) {
        throw new TypeError('can not read "filter" of null or undefined');
    }
    if (Object.prototype.toString.call(callback) !== '[object Function]') {
        throw new TypeError(callback + ' is not a function');
    }
    let O = Object(this);
    let len = O.length >>> 0;
    let to = 0;
    let A = [];
    for (let k = 0; k < len; k++) {
        if (k in O) {
            let kValue = O[k];
            if (callback.call(thisArg, kValue, k, O)) {
                A[to++] = kValue;
            }
        }
    }
    return A;
}

/** ************************************************************************************************************** **/

// push，规范如下：
// Let O be ? ToObject(this value).
// Let len be ? LengthOfArrayLike(O).
//     Let items be a List whose elements are, in left to right order, the arguments that were passed to this function invocation.
// Let argCount be the number of elements in items.
//     If len + argCount > 253 - 1, throw a TypeError exception.
//     Repeat, while items is not empty,
//     Remove the first element from items and let E be the value of the element.
//     Perform ? Set(O, ! ToString(len), E, true).
//     Set len to len + 1.
// Perform ? Set(O, "length", len, true).
//     Return len.
Array.prototype.push1 = function (...items) {
    if (this === null || this === undefined) {
        throw new TypeError('can not read "push" of null or undefined');
    }
    let O = Object(this);
    let len = O.length >>> 0;
    let argsLen = items.length >>> 0;
    if (len + argsLen > 2 ** 53 - 1) {
        throw new TypeError('超出数组最大元素数量限制')
    }
    for (let i = 0; i < argsLen; i++) {
        O[len + i] = items[i];
    }
    O.length = len + argsLen;
    return O.length;
}

// pop，规范如下：
// Let O be ? ToObject(this value).
// Let len be ? LengthOfArrayLike(O).
//     If len is zero, then
// Perform ? Set(O, "length", 0, true).
//     Return undefined.
//     Else,
//     Assert: len > 0.
// Let newLen be len - 1.
// Let index be ! ToString(newLen).
//     Let element be ? Get(O, index).
//     Perform ? DeletePropertyOrThrow(O, index).
//     Perform ? Set(O, "length", newLen, true).
//     Return element.
Array.prototype.pop1 = function () {
    if (this === null || this === undefined) {
        throw new TypeError('can not read "pop" of null or undefined');
    }
    let O = Object(this);
    let len = O.length >>> 0;
    if (len === 0) {
        O.length = 0;
        return;
    }
    let newLen = len - 1;
    let element = O[newLen];
    delete O[newLen];
    O.length = newLen;
    return element;
}