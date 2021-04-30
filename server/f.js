'use strict';
exports.take = function (arr, item) {
    arr.splice(arr.indexOf(item), 1);
    return arr;
};
exports.isArr = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};
