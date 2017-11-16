"use strict";

exports.__esModule = true;
function get(state) {
    return function (key) {
        return state[key] || "";
    };
}

function set(state) {
    return function (key, value) {
        state[key] = value;
        return this;
    };
}

exports.get = get;
exports.set = set;