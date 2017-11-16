"use strict";

exports.__esModule = true;
exports.default = emitter;

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _emitter;
function emitter() {
    if (!_emitter) {
        _emitter = (0, _eventEmitter2.default)({});
    }
    return _emitter;
}
module.exports = exports["default"];