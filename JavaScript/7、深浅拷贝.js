// 所有安全的JSON都会被JSON.stringify字符串化，
// 不安全的JSON：undefined、function、symbol、循环引用的对象 会被JSON.stringify忽略，在数组中返回null
// 如：JSON.stringify({a: undefined, b: 1, c: function(){}}) => "{"b":1}"
// JSON.stringify([undefined, function(){}, 1, 2]) => "[null, null, 1, 2]"
function deepcopy1(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 浅拷贝
function deepcopy2(obj) {
    if (typeof obj !== 'object') return;
    var objClone = obj instanceof Array ? [] : {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            objClone[key] = obj[key];
        }
    }
    return objClone;
}

// 深拷贝
// 未考虑循环引用问题
// undefined以及函数拷贝问题
function deepcopy3(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    var objClone = obj instanceof Array ? [] : {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            objClone[key] = deepcopy3(obj[key]);
        }
    }
    return objClone;
}

// 使用WeakMap解决循环引用问题
// WeakMap使用弱引用，不会使map与对象之间形成强引用导致对象无法回收
function deepCopy4(target, map = new WeakMap()) {
    if (typeof target !== 'object' || target === null) return target;

    if (map.get(target)) return target;

    var clone = Array.isArray(target) ? [] : {};
    map.set(target, true);
    for (var key in target) {
        if (target.hasOwnProperty(key)) {
            clone[key] = deepCopy4(target[key], map);
        }
    }
    return clone;
}

// 解决特殊对象拷贝问题
// 下面方法了解即可
const getType = obj => Object.prototype.toString.call(obj);
const isObject = (target) => (typeof target === 'object' || typeof target === 'function') && target !== null;
const canTraverse = {
    '[object Map]': true,
    '[object Set]': true,
    '[object Array]': true,
    '[object Object]': true,
    '[object Arguments]': true,
};
const mapTag = '[object Map]';
const setTag = '[object Set]';
const boolTag = '[object Boolean]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const dateTag = '[object Date]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

const handleRegExp = (target) => {
    const { source, flags } = target;
    return new target.constructor(source, flags);
}

const handleFunc = (func) => {
    // 箭头函数直接返回自身
    if(!func.prototype) return func;
    const bodyReg = /(?<={)(.|\n)+(?=})/m;
    const paramReg = /(?<=\().+(?=\)\s+{)/;
    const funcString = func.toString();
    // 分别匹配 函数参数 和 函数体
    const param = paramReg.exec(funcString);
    const body = bodyReg.exec(funcString);
    if(!body) return null;
    if (param) {
        const paramArr = param[0].split(',');
        return new Function(...paramArr, body[0]);
    } else {
        return new Function(body[0]);
    }
}

const handleNotTraverse = (target, tag) => {
    const Ctor = target.constructor;
    switch(tag) {
        case boolTag:
            return new Object(Boolean.prototype.valueOf.call(target));
        case numberTag:
            return new Object(Number.prototype.valueOf.call(target));
        case stringTag:
            return new Object(String.prototype.valueOf.call(target));
        case symbolTag:
            return new Object(Symbol.prototype.valueOf.call(target));
        case errorTag:
        case dateTag:
            return new Ctor(target);
        case regexpTag:
            return handleRegExp(target);
        case funcTag:
            return handleFunc(target);
        default:
            return new Ctor(target);
    }
}

const deepClone = (target, map = new Map()) => {
    if(!isObject(target))
        return target;
    let type = getType(target);
    let cloneTarget;
    if(!canTraverse[type]) {
        // 处理不能遍历的对象
        return handleNotTraverse(target, type);
    }else {
        // 这波操作相当关键，可以保证对象的原型不丢失！
        let ctor = target.constructor;
        cloneTarget = new ctor();
    }

    if(map.get(target))
        return target;
    map.set(target, true);

    if(type === mapTag) {
        //处理Map
        target.forEach((item, key) => {
            cloneTarget.set(deepClone(key, map), deepClone(item, map));
        })
    }

    if(type === setTag) {
        //处理Set
        target.forEach(item => {
            cloneTarget.add(deepClone(item, map));
        })
    }

    // 处理数组和对象
    for (let prop in target) {
        if (target.hasOwnProperty(prop)) {
            cloneTarget[prop] = deepClone(target[prop], map);
        }
    }
    return cloneTarget;
}