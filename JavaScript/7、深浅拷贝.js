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
function deepcopy3(obj) {
    if (typeof obj !== 'object') return;
    var objClone = obj instanceof Array ? [] : {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            objClone[key] = Object.prototype.toString.call(obj[key]) === '[object Object]' ? deepcopy3(obj[key]) : obj[key];
        }
    }
    return objClone;
}

