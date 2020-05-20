// 我们创建一个type api实现可以判断数据的类型，包括基本类型和引用类型
// 利用了Object.prototype.toString方法
// Object.prototype.toString.call(new Date())   ==> "[object Date]"
// Object.prototype.toString.call(new Object()) ==> "[object Object]"
// Object.prototype.toString.call(undefined)    ==> "[object Undefined]"
// Object.prototype.toString.call('abc')        ==> "[object String]"
// Object.prototype.toString.call(123)          ==> "[object Number]"
// Object.prototype.toString.call(null)         ==> "[object Null]"

function type(obj) {
    // 因为null == undefined为true，null === undefined也为true，这里就随便采用 ==
    // 如果obj是null或者undefined，返回“null”或者“undefined”
    // 在IE6中，null和undefined会被Object.prototype.toString识别为[object Object]
    if (obj == null) {
        return '' + obj;
    }

    // 基本类型用typeof，引用类型用Object.prototype.toString
    // 当然统一用Object.prototype.toString也可以
    var typeString = Object.prototype.toString.call(obj).toLowerCase();
    return typeof obj === 'object' || typeof obj === 'function' ?
        typeString.substring(8, typeString.length - 1) : typeof obj;
}

// 判断obj是否window对象
// window对象有属性window指向自身，可用这个判断
function isWindow(obj) {
    return !!obj && obj === obj.window;
}

// 创建一个isArrayLike判断类数组
// var arrayLike = {
//     0: 'a',
//     1: 'b',
//     3: 'c',
//     length: 3
// }
// 上述的arrayLike就是类数组，没有push、pop等数组方法，而且length值也不会动态改变，但是可以使用for循环
// 函数体内的arguments就是类数组
// 以下方法当array为真数组或者类数组都会返回true
function isArrayLike(array) {
    var length = !!array && length in array && array.length,
        typeRes = type(array);

    if (typeRes === 'function' || isWindow(array)) return false;

    return typeRes === 'array' || length === 0 ||
        typeof length === 'number' && length > 0 && (length - 1) in array;
}