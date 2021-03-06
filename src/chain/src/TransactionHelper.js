let helper = {};

import secureRandom from 'secure-random';

import {Long} from 'bytebuffer';

import {Signature} from "../../ecc";
import {ops} from "../../serializer";
import {Apis} from "../../ws/cjs";

helper.unique_nonce_entropy = null;
helper.unique_nonce_uint64 = function () {
    let entropy = helper.unique_nonce_entropy = ((() => {
            if (helper.unique_nonce_entropy === null) {
                return parseInt(secureRandom.randomUint8Array(1)[0]);
            } else {
                return ++helper.unique_nonce_entropy % 256;
            }
        })()
    );
    let long = Long.fromNumber(Date.now());
    long = long.shiftLeft(8).or(Long.fromNumber(entropy));
    return long.toString();
};

/* Todo, set fees */
helper.to_json = function (tr, broadcast = false) {
    return (function (tr, broadcast) {
            let tr_object = ops.signed_transaction.toObject(tr);
            if (broadcast) {
                let net = Apis.instance().network_api();
                if (process.env.ENVIRONMENT === 'DEV') {
                    console.log('... tr_object', JSON.stringify(tr_object));
                }
                return net.exec("broadcast_transaction", [tr_object]);
            } else {
                return tr_object;
            }
        }
    )(tr, broadcast);
};

helper.signed_tr_json = function (tr, private_keys) {
    let tr_buffer = ops.transaction.toBuffer(tr);
    tr = ops.transaction.toObject(tr);
    tr.signatures = (() => {
        let result = [];
        for (let i = 0; 0 < private_keys.length ? i < private_keys.length : i > private_keys.length; 0 < private_keys.length ? i++ : i++) {
            let private_key = private_keys[i];
            result.push(Signature.signBuffer(tr_buffer, private_key).toHex());
        }
        return result;
    })();
    return tr;
};

helper.expire_in_min = function (min) {
    return Math.round(Date.now() / 1000) + (min * 60);
};

helper.seconds_from_now = function (timeout_sec) {
    return Math.round(Date.now() / 1000) + timeout_sec;
};

/**
 Print to the console a JSON representation of any object in
 @graphene/serializer { types }
 */
helper.template = function (serializer_operation_type_name, debug = {use_default: true, annotate: true}) {
    let so = type[serializer_operation_type_name];
    if (!so) {
        throw new Error(`unknown serializer_operation_type ${serializer_operation_type_name}`);
    }
    return so.toObject(undefined, debug);
};

helper.new_operation = function (serializer_operation_type_name) {
    let so = type[serializer_operation_type_name];
    if (!so) {
        throw new Error(`unknown serializer_operation_type ${serializer_operation_type_name}`);
    }
    let object = so.toObject(undefined, {use_default: true, annotate: true});
    return so.fromObject(object);
};

helper.instance = function (ObjectId) {
    return ObjectId.substring("0.0.".length);
};

export default helper;
