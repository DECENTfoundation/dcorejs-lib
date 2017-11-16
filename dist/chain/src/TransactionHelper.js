'use strict';

exports.__esModule = true;

var _secureRandom = require('secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _bytebuffer = require('bytebuffer');

var _ecc = require('../../ecc');

var _serializer = require('../../serializer');

var _ws = require('../../ws');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var helper = {};

helper.unique_nonce_entropy = null;
helper.unique_nonce_uint64 = function () {
    var entropy = helper.unique_nonce_entropy = function () {

        if (helper.unique_nonce_entropy === null) {
            //console.log('... secureRandom.randomUint8Array(1)[0]',secureRandom.randomUint8Array(1)[0])
            return parseInt(_secureRandom2.default.randomUint8Array(1)[0]);
        } else {
            return ++helper.unique_nonce_entropy % 256;
        }
    }();
    var long = _bytebuffer.Long.fromNumber(Date.now());
    //console.log('unique_nonce_uint64 date\t',ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    //console.log('unique_nonce_uint64 entropy\t',ByteBuffer.allocate(8).writeUint64(Long.fromNumber(entropy)).toHex(0))
    long = long.shiftLeft(8).or(_bytebuffer.Long.fromNumber(entropy));
    //console.log('unique_nonce_uint64 shift8\t',ByteBuffer.allocate(8).writeUint64(long).toHex(0))
    return long.toString();
};

/* Todo, set fees */
helper.to_json = function (tr) {
    var broadcast = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return function (tr, broadcast) {
        var tr_object = _serializer.ops.signed_transaction.toObject(tr);
        if (broadcast) {
            var net = _ws.Apis.instance().network_api();
            console.log('... tr_object', JSON.stringify(tr_object));
            return net.exec("broadcast_transaction", [tr_object]);
        } else {
            return tr_object;
        }
    }(tr, broadcast);
};

helper.signed_tr_json = function (tr, private_keys) {
    var tr_buffer = _serializer.ops.transaction.toBuffer(tr);
    tr = _serializer.ops.transaction.toObject(tr);
    tr.signatures = function () {
        var result = [];
        for (var i = 0; 0 < private_keys.length ? i < private_keys.length : i > private_keys.length; 0 < private_keys.length ? i++ : i++) {
            var private_key = private_keys[i];
            result.push(_ecc.Signature.signBuffer(tr_buffer, private_key).toHex());
        }
        return result;
    }();
    return tr;
};

helper.expire_in_min = function (min) {
    return Math.round(Date.now() / 1000) + min * 60;
};

helper.seconds_from_now = function (timeout_sec) {
    return Math.round(Date.now() / 1000) + timeout_sec;
};

/**
    Print to the console a JSON representation of any object in
    @graphene/serializer { types }
*/
helper.template = function (serializer_operation_type_name) {
    var debug = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { use_default: true, annotate: true };

    var so = type[serializer_operation_type_name];
    if (!so) {
        throw new Error('unknown serializer_operation_type ' + serializer_operation_type_name);
    }
    return so.toObject(undefined, debug);
};

helper.new_operation = function (serializer_operation_type_name) {
    var so = type[serializer_operation_type_name];
    if (!so) {
        throw new Error('unknown serializer_operation_type ' + serializer_operation_type_name);
    }
    var object = so.toObject(undefined, { use_default: true, annotate: true });
    return so.fromObject(object);
};

helper.instance = function (ObjectId) {
    return ObjectId.substring("0.0.".length);
};

exports.default = helper;
module.exports = exports['default'];