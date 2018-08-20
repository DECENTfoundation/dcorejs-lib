// Low-level types that make up operations

import SerializerValidation from './SerializerValidation';
import FastParser from './FastParser';

import ChainTypes from "../../chain/src/ChainTypes";
import ObjectId from "../../chain/src/ObjectId";

import {Address, PublicKey} from "../../ecc";
import {ChainConfig} from "../../ws/cjs";

let Types = {};

const HEX_DUMP = process.env.npm_config__graphene_serializer_hex_dump;


Types.uint8 = {

    fromByteBuffer(byteBuffer) {
        return byteBuffer.readUint8();
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.require_range(0, 0xFF, object, `uint8 ${object}`);
        byteBuffer.writeUint8(object);
    },
    fromObject(object) {
        SerializerValidation.require_range(0, 0xFF, object, `uint8 ${object}`);
        return object;
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return 0;
        }
        SerializerValidation.require_range(0, 0xFF, object, `uint8 ${object}`);
        return parseInt(object);
    }
};


let MIN_SIGNED_8 = -1 * Math.pow(2, 7);
let MAX_SIGNED_8 = Math.pow(2, 7) - 1;

Types.int8 = {

    fromByteBuffer(byteBuffer) {
        return byteBuffer.readInt8();
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.require_range(0, 0xFF, object, `int8 ${object}`);
        byteBuffer.writeInt8(object);
    },
    fromObject(object) {
        SerializerValidation.require_range(0, 0xFF, object, `int8 ${object}`);
        return object;
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return 0;
        }
        SerializerValidation.require_range(
            MIN_SIGNED_8,
            MAX_SIGNED_8,
            object,
            `uint32 ${object}`
        );
        return parseInt(object);
    }
};

Types.uint16 = {
    fromByteBuffer(byteBuffer) {
        return byteBuffer.readUint16();
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.require_range(0, 0xFFFF, object, `uint16 ${object}`);
        byteBuffer.writeUint16(object);
    },
    fromObject(object) {
        SerializerValidation.require_range(0, 0xFFFF, object, `uint16 ${object}`);
        return object;
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return 0;
        }
        SerializerValidation.require_range(0, 0xFFFF, object, `uint16 ${object}`);
        return parseInt(object);
    }
};

Types.uint32 = {
    fromByteBuffer(byteBuffer) {
        return byteBuffer.readUint32();
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.require_range(0, 0xFFFFFFFF, object, `uint32 ${object}`);
        byteBuffer.writeUint32(object);
    },
    fromObject(object) {
        SerializerValidation.require_range(0, 0xFFFFFFFF, object, `uint32 ${object}`);
        return object;
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return 0;
        }
        SerializerValidation.require_range(0, 0xFFFFFFFF, object, `uint32 ${object}`);
        return parseInt(object);
    }
};

let MIN_SIGNED_32 = -1 * Math.pow(2, 31);
let MAX_SIGNED_32 = Math.pow(2, 31) - 1;

Types.varint32 = {
    fromByteBuffer(byteBuffer) {
        return byteBuffer.readVarint32();
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.require_range(
            MIN_SIGNED_32,
            MAX_SIGNED_32,
            object,
            `uint32 ${object}`
        );
        byteBuffer.writeVarint32(object);
    },
    fromObject(object) {
        SerializerValidation.require_range(
            MIN_SIGNED_32,
            MAX_SIGNED_32,
            object,
            `uint32 ${object}`
        );
        return object;
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return 0;
        }
        SerializerValidation.require_range(
            MIN_SIGNED_32,
            MAX_SIGNED_32,
            object,
            `uint32 ${object}`
        );
        return parseInt(object);
    }
};

Types.int64 = {
    fromByteBuffer(byteBuffer) {
        return byteBuffer.readInt64();
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.required(object);
        byteBuffer.writeInt64(SerializerValidation.to_long(object));
    },
    fromObject(object) {
        SerializerValidation.required(object);
        return SerializerValidation.to_long(object);
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return "0";
        }
        SerializerValidation.required(object);
        return SerializerValidation.to_long(object).toString();
    }
};

Types.uint64 = {
    fromByteBuffer(byteBuffer) {
        return byteBuffer.readUint64();
    },
    appendByteBuffer(byteBuffer, object) {
        byteBuffer.writeUint64(SerializerValidation.to_long(SerializerValidation.unsigned(object)));
    },
    fromObject(object) {
        return SerializerValidation.to_long(SerializerValidation.unsigned(object));
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return "0";
        }
        return SerializerValidation.to_long(object).toString();
    }
};

Types.string = {
    fromByteBuffer(byteBuffer) {
        let b_copy;
        let len = byteBuffer.readVarint32();
        b_copy = byteBuffer.copy(byteBuffer.offset, byteBuffer.offset + len);
        byteBuffer.skip(len);
        return new Buffer(b_copy.toBinary(), 'binary');
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.required(object);
        byteBuffer.writeVarint32(object.length);
        byteBuffer.append(object.toString('binary'), 'binary');
    },
    fromObject(object) {
        SerializerValidation.required(object);
        return new Buffer(object);
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return "";
        }
        return object.toString();
    }
};

Types.bytes = function (size) {
    return {
        fromByteBuffer(byteBuffer) {
            if (size === undefined) {
                let b_copy;
                let len = byteBuffer.readVarint32();
                b_copy = byteBuffer.copy(byteBuffer.offset, byteBuffer.offset + len);
                byteBuffer.skip(len);
                return new Buffer(b_copy.toBinary(), 'binary');
            } else {
                b_copy = byteBuffer.copy(byteBuffer.offset, byteBuffer.offset + size);
                byteBuffer.skip(size);
                return new Buffer(b_copy.toBinary(), 'binary');
            }
        },
        appendByteBuffer(byteBuffer, object) {
            SerializerValidation.required(object);
            if (typeof object === "string") {
                object = new Buffer(object, "hex");
            }
            if (size === undefined) {
                byteBuffer.writeVarint32(object.length);
            }
            byteBuffer.append(object.toString('binary'), 'binary');
        },
        fromObject(object) {
            SerializerValidation.required(object);
            if (Buffer.isBuffer(object)) {
                return object;
            }
            return new Buffer(object, 'hex');
        },
        toObject(object, debug = {}) {
            if (debug.use_default && object === undefined) {
                let zeros = function (num) {
                    return new Array(num).join("00");
                };
                return zeros(size);
            }
            SerializerValidation.required(object);
            return object.toString('hex');
        }
    };
};

Types.bool = {
    fromByteBuffer(byteBuffer) {
        return byteBuffer.readUint8() === 1
    },
    appendByteBuffer(byteBuffer, object) {
        // supports boolean or integer
        byteBuffer.writeUint8(JSON.parse(object) ? 1 : 0);
    },
    fromObject(object) {
        return !!JSON.parse(object)
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return false;
        }
        return !!JSON.parse(object)
    }
};

Types.void = {
    fromByteBuffer(byteBuffer) {
        throw new Error("(void) undefined type");
    },
    appendByteBuffer(byteBuffer, object) {
        throw new Error("(void) undefined type");
    },
    fromObject(object) {
        throw new Error("(void) undefined type");
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return undefined;
        }
        throw new Error("(void) undefined type");
    }
};

Types.array = function (st_operation) {
    return {
        fromByteBuffer(byteBuffer) {
            let size = byteBuffer.readVarint32();
            if (HEX_DUMP && process.env.ENVIRONMENT === 'DEV') {
                console.log("varint32 size = " + size.toString(16));
            }
            let result = [];
            for (let i = 0; 0 < size ? i < size : i > size; 0 < size ? i++ : i++) {
                result.push(st_operation.fromByteBuffer(b));
            }
            return sortOperation(result, st_operation);
        },
        appendByteBuffer(byteBuffer, object) {
            SerializerValidation.required(object);
            object = sortOperation(object, st_operation);
            byteBuffer.writeVarint32(object.length);
            for (let i = 0, o; i < object.length; i++) {
                o = object[i];
                st_operation.appendByteBuffer(byteBuffer, o);
            }
        },
        fromObject(object) {
            SerializerValidation.required(object);
            object = sortOperation(object, st_operation);
            let result = [];
            for (let i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push(st_operation.fromObject(o));
            }
            return result;
        },
        toObject(object, debug = {}) {
            if (debug.use_default && object === undefined) {
                return [st_operation.toObject(object, debug)];
            }
            SerializerValidation.required(object);
            object = sortOperation(object, st_operation);

            let result = [];
            for (let i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push(st_operation.toObject(o, debug));
            }
            return result;
        }
    };
};

Types.time_point_sec = {
    fromByteBuffer(byteBuffer) {
        return byteBuffer.readUint32();
    },
    appendByteBuffer(byteBuffer, object) {
        if (typeof object !== "number") {
            object = Types.time_point_sec.fromObject(object);
        }
        byteBuffer.writeUint32(object);
    },
    fromObject(object) {
        SerializerValidation.required(object);

        if (typeof object === "number") {
            return object;
        }

        if (object.getTime) {
            return Math.floor(object.getTime() / 1000);
        }

        if (typeof object !== "string") {
            throw new Error("Unknown date type: " + object);
        }

        // if(typeof object === "string" && !/Z$/.test(object))
        //     object = object + "Z"

        return Math.floor(new Date(object).getTime() / 1000);
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return (new Date(0)).toISOString().split('.')[0];
        }
        SerializerValidation.required(object);

        if (typeof object === "string") {
            return object;
        }

        if (object.getTime) {
            return object.toISOString().split('.')[0];
        }

        let int = parseInt(object);
        SerializerValidation.require_range(0, 0xFFFFFFFF, int, `uint32 ${object}`);
        return (new Date(int * 1000)).toISOString().split('.')[0];
    }
};

Types.set = function (st_operation) {
    return {
        validate(array) {
            let dup_map = {};
            for (let i = 0, o; i < array.length; i++) {
                o = array[i];
                let ref;
                if (ref = typeof o, ['string', 'number'].indexOf(ref) >= 0) {
                    if (dup_map[o] !== undefined) {
                        throw new Error("duplicate (set)");
                    }
                    dup_map[o] = true;
                }
            }
            return sortOperation(array, st_operation);
        },
        fromByteBuffer(byteBuffer) {
            let size = byteBuffer.readVarint32();
            if (HEX_DUMP && process.env.ENVIRONMENT === 'DEV') {
                console.log("varint32 size = " + size.toString(16));
            }
            return this.validate(((() => {
                let result = [];
                for (let i = 0; 0 < size ? i < size : i > size; 0 < size ? i++ : i++) {
                    result.push(st_operation.fromByteBuffer(byteBuffer));
                }
                return result;
            })()));
        },
        appendByteBuffer(byteBuffer, object) {
            if (!object) {
                object = [];
            }
            byteBuffer.writeVarint32(object.length);
            let iterable = this.validate(object);
            for (let i = 0, o; i < iterable.length; i++) {
                o = iterable[i];
                st_operation.appendByteBuffer(byteBuffer, o);
            }
        },
        fromObject(object) {
            if (!object) {
                object = [];
            }
            return this.validate(((() => {
                let result = [];
                for (let i = 0, o; i < object.length; i++) {
                    o = object[i];
                    result.push(st_operation.fromObject(o));
                }
                return result;
            })()));
        },
        toObject(object, debug = {}) {
            if (debug.use_default && object === undefined) {
                return [st_operation.toObject(object, debug)];
            }
            if (!object) {
                object = [];
            }
            return this.validate(((() => {
                let result = [];
                for (let i = 0, o; i < object.length; i++) {
                    o = object[i];
                    result.push(st_operation.toObject(o, debug));
                }
                return result;
            })()));
        }
    };
};

// global_parameters_update_operation current_fees
Types.fixed_array = function (count, st_operation) {
    return {
        fromByteBuffer: function (byteBuffer) {
            let i, j, ref, results;
            results = [];
            for (i = j = 0, ref = count; j < ref; i = j += 1) {
                results.push(st_operation.fromByteBuffer(byteBuffer));
            }
            return sortOperation(results, st_operation);
        },
        appendByteBuffer: function (byteBuffer, object) {
            let i, j, ref;
            if (count !== 0) {
                SerializerValidation.required(object);
                object = sortOperation(object, st_operation)
            }
            for (i = j = 0, ref = count; j < ref; i = j += 1) {
                st_operation.appendByteBuffer(byteBuffer, object[i]);
            }
        },
        fromObject: function (object) {
            let i, j, ref, results;
            if (count !== 0) {
                SerializerValidation.required(object);
            }
            results = [];
            for (i = j = 0, ref = count; j < ref; i = j += 1) {
                results.push(st_operation.fromObject(object[i]));
            }
            return results;
        },
        toObject: function (object, debug) {
            let i, j, k, ref, ref1, results, results1;
            if (debug == null) {
                debug = {};
            }
            if (debug.use_default && object === void 0) {
                results = [];
                for (i = j = 0, ref = count; j < ref; i = j += 1) {
                    results.push(st_operation.toObject(void 0, debug));
                }
                return results;
            }
            if (count !== 0) {
                SerializerValidation.required(object);
            }
            results1 = [];
            for (i = k = 0, ref1 = count; k < ref1; i = k += 1) {
                results1.push(st_operation.toObject(object[i], debug));
            }
            return results1;
        }
    };
};

/* Supports instance numbers (11) or object types (1.2.11).  Object type
Validation is enforced when an object type is used. */
let id_type = function (reserved_spaces, object_type) {
    SerializerValidation.required(reserved_spaces, "reserved_spaces");
    SerializerValidation.required(object_type, "object_type");
    return {
        fromByteBuffer(byteBuffer) {
            return byteBuffer.readVarint32();
        },
        appendByteBuffer(byteBuffer, object) {
            SerializerValidation.required(object);
            if (object.resolve !== undefined) {
                object = object.resolve;
            }
            try {
                // convert 1.2.n into just n
                if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(object)) {
                    object = SerializerValidation.get_instance(reserved_spaces, object_type, object);
                }
                byteBuffer.writeVarint32(SerializerValidation.to_number(object));
            } catch (exception) {
                throw new Error(exception);
            }
        },
        fromObject(object) {
            SerializerValidation.required(object);
            if (object.resolve !== undefined) {
                object = object.resolve;
            }
            try {
                if (SerializerValidation.is_digits(object)) {
                    return SerializerValidation.to_number(object);
                }
                return SerializerValidation.get_instance(reserved_spaces, object_type, object);
            } catch (exception) {
                throw new Error(exception);
            }
        },
        toObject(object, debug = {}) {
            let object_type_id;
            if (reserved_spaces === 1) {
                object_type_id = ChainTypes.object_type[object_type];
            } else if (reserved_spaces === 2) {
                object_type_id = ChainTypes.impl_object_type[object_type];
            }
            if (debug.use_default && object === undefined) {
                return `${reserved_spaces}.${object_type_id}.0`;
            }
            SerializerValidation.required(object);
            if (object.resolve !== undefined) {
                object = object.resolve;
            }
            try {
                if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(object)) {
                    object = SerializerValidation.get_instance(reserved_spaces, object_type, object);
                }
                return `${reserved_spaces}.${object_type_id}.` + object;
            } catch (exception) {
                throw new Error(exception);
            }
        },
    };
};

Types.protocol_id_type = function (name) {
    SerializerValidation.required(name, "name");
    return id_type(ChainTypes.reserved_spaces.protocol_ids, name);
};

Types.implementation_id_type = function (name) {
    SerializerValidation.required(name, "name");
    return id_type(ChainTypes.reserved_spaces.implementation_ids, name);
};

Types.object_id_type = {
    fromByteBuffer(b) {
        return ObjectId.fromByteBuffer(b);
    },
    appendByteBuffer(b, object) {
        SerializerValidation.required(object);
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        object = ObjectId.fromString(object);
        object.appendByteBuffer(b);
    },
    fromObject(object) {
        SerializerValidation.required(object);
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        return ObjectId.fromString(object);
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return "0.0.0";
        }
        SerializerValidation.required(object);
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        object = ObjectId.fromString(object);
        return object.toString();
    }
};

Types.vote_id = {
    TYPE: 0x000000FF,
    ID: 0xFFFFFF00,
    fromByteBuffer(byteBuffer) {
        let value = byteBuffer.readUint32();
        return {
            type: value & this.TYPE,
            id: value & this.ID
        };
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.required(object);
        if (object === "string") {
            object = Types.vote_id.fromObject(object);
        }
        let value = object.id << 8 | object.type;
        byteBuffer.writeUint32(value);
    },
    fromObject(object) {
        SerializerValidation.required(object, "(type vote_id)");
        if (typeof object === "object") {
            SerializerValidation.required(object.type, "type");
            SerializerValidation.required(object.id, "id");
            return object;
        }
        SerializerValidation.require_test(/^[0-9]+:[0-9]+$/, object, `vote_id format ${object}`);
        let [type, id] = object.split(':');
        SerializerValidation.require_range(0, 0xff, type, `vote type ${object}`);
        SerializerValidation.require_range(0, 0xffffff, id, `vote id ${object}`);
        return {type, id};
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return "0:0";
        }
        SerializerValidation.required(object);
        if (typeof object === "string") {
            object = Types.vote_id.fromObject(object);
        }
        return object.type + ":" + object.id;
    },
    compare(a, b) {
        if (typeof a !== "object") {
            a = Types.vote_id.fromObject(a);
        }
        if (typeof b !== "object") {
            b = Types.vote_id.fromObject(b);
        }
        return parseInt(a.id) - parseInt(b.id);
    }
};

Types.optional = function (st_operation) {
    SerializerValidation.required(st_operation, "st_operation");
    return {
        fromByteBuffer(byteBuffer) {
            if (!(byteBuffer.readUint8() === 1)) {
                return undefined;
            }
            return st_operation.fromByteBuffer(byteBuffer);
        },
        appendByteBuffer(byteBuffer, object) {
            if (object !== null && object !== undefined) {
                byteBuffer.writeUint8(1);
                st_operation.appendByteBuffer(byteBuffer, object);
            } else {
                byteBuffer.writeUint8(0);
            }
        },
        fromObject(object) {
            if (object === undefined) {
                return undefined;
            }
            return st_operation.fromObject(object);
        },
        toObject(object, debug = {}) {
            // toObject is only null save if use_default is true
            let result_object = (() => {
                if (!debug.use_default && object === undefined) {
                    return undefined;
                } else {
                    return st_operation.toObject(object, debug);
                }
            })();

            if (debug.annotate) {
                if (typeof result_object === "object") {
                    result_object.__optional = "parent is optional";
                } else {
                    result_object = {__optional: result_object};
                }
            }
            return result_object;
        }
    };
};

Types.static_variant = function (_st_operations) {
    return {
        nosort: true,
        st_operations: _st_operations,
        fromByteBuffer(byteBuffer) {
            let type_id = byteBuffer.readVarint32();
            let st_operation = this.st_operations[type_id];
            if (HEX_DUMP) {
                console.error(`static_variant id 0x${type_id.toString(16)} (${type_id})`);
            }
            SerializerValidation.required(st_operation, `operation ${type_id}`);
            return [
                type_id,
                st_operation.fromByteBuffer(byteBuffer)
            ];
        },
        appendByteBuffer(byteBuffer, object) {
            SerializerValidation.required(object);
            let type_id = object[0];
            let st_operation = this.st_operations[type_id];
            SerializerValidation.required(st_operation, `operation ${type_id}`);
            byteBuffer.writeVarint32(type_id);
            st_operation.appendByteBuffer(byteBuffer, object[1]);
        },
        fromObject(object) {
            SerializerValidation.required(object);
            let type_id = object[0];
            let st_operation = this.st_operations[type_id];
            SerializerValidation.required(st_operation, `operation ${type_id}`);
            return [
                type_id,
                st_operation.fromObject(object[1])
            ];
        },
        toObject(object, debug = {}) {
            if (debug.use_default && object === undefined) {
                return [0, this.st_operations[0].toObject(undefined, debug)];
            }
            SerializerValidation.required(object);
            let type_id = object[0];
            let st_operation = this.st_operations[type_id];
            SerializerValidation.required(st_operation, `operation ${type_id}`);
            return [
                type_id,
                st_operation.toObject(object[1], debug)
            ];
        }
    };
};

Types.map = function (key_st_operation, value_st_operation) {
    return {
        validate(array) {
            if (!Array.isArray(array)) {
                throw new Error("expecting array");
            }
            let dup_map = {};
            for (let i = 0, o; i < array.length; i++) {
                o = array[i];
                let ref;
                if (!(o.length === 2)) {
                    throw new Error("expecting two elements");
                }
                if (ref = typeof o[0], ['number', 'string'].indexOf(ref) >= 0) {
                    if (dup_map[o[0]] !== undefined) {
                        throw new Error("duplicate (map)");
                    }
                    dup_map[o[0]] = true;
                }
            }
            return sortOperation(array, key_st_operation);
        },

        fromByteBuffer(byteBuffer) {
            let result = [];
            let end = byteBuffer.readVarint32();
            for (let i = 0; 0 < end ? i < end : i > end; 0 < end ? i++ : i++) {
                result.push([
                    key_st_operation.fromByteBuffer(byteBuffer),
                    value_st_operation.fromByteBuffer(byteBuffer)
                ]);
            }
            return this.validate(result);
        },

        appendByteBuffer(byteBuffer, object) {
            this.validate(object);
            byteBuffer.writeVarint32(object.length);
            for (let i = 0, o; i < object.length; i++) {
                o = object[i];
                key_st_operation.appendByteBuffer(byteBuffer, o[0]);
                value_st_operation.appendByteBuffer(byteBuffer, o[1]);
            }
        },
        fromObject(object) {
            SerializerValidation.required(object);
            let result = [];
            for (let i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push([
                    key_st_operation.fromObject(o[0]),
                    value_st_operation.fromObject(o[1])
                ]);
            }
            return this.validate(result)
        },
        toObject(object, debug = {}) {
            if (debug.use_default && object === undefined) {
                return [
                    [
                        key_st_operation.toObject(undefined, debug),
                        value_st_operation.toObject(undefined, debug)
                    ]
                ];
            }
            SerializerValidation.required(object);
            object = this.validate(object);
            let result = [];
            for (let i = 0, o; i < object.length; i++) {
                o = object[i];
                result.push([
                    key_st_operation.toObject(o[0], debug),
                    value_st_operation.toObject(o[1], debug)
                ]);
            }
            return result
        }
    };
};

Types.public_key = {
    toPublic(object) {
        if (object.resolve !== undefined) {
            object = object.resolve;
        }
        return object == null ? object :
            object.Q ? object : PublicKey.fromStringOrThrow(object)
    },
    fromByteBuffer(byteBuffer) {
        return FastParser.public_key(byteBuffer);
    },
    appendByteBuffer(byteBuffer, object) {
        SerializerValidation.required(object);
        FastParser.public_key(byteBuffer, Types.public_key.toPublic(object));
    },
    fromObject(object) {
        SerializerValidation.required(object);
        if (object.Q) {
            return object;
        }
        return Types.public_key.toPublic(object);
    },
    toObject(object, debug = {}) {
        if (debug.use_default && object === undefined) {
            return ChainConfig.address_prefix + "859gxfnXyUriMgUeThh1fWv3oqcpLFyHa3TfFYC4PK2HqhToVM";
        }
        SerializerValidation.required(object);
        return object.toString()
    },
    compare(a, b) {
        return strCmp(a.toAddressString(), b.toAddressString())
    }
};

Types.address =
    {
        _to_address(object) {
            SerializerValidation.required(object);
            if (object.addy) {
                return object;
            }
            return Address.fromString(object);
        },
        fromByteBuffer(byteBuffer) {
            return new Address(FastParser.ripemd160(byteBuffer));
        },
        appendByteBuffer(byteBuffer, object) {
            FastParser.ripemd160(byteBuffer, Types.address._to_address(object).toBuffer());
        },
        fromObject(object) {
            return Types.address._to_address(object);
        },
        toObject(object, debug = {}) {
            if (debug.use_default && object === undefined) {
                return ChainConfig.address_prefix + "664KmHxSuQyDsfwo4WEJvWpzg1QKdg67S";
            }
            return Types.address._to_address(object).toString();
        },
        compare(a, b) {
            return strCmp(a.toString(), b.toString())
        }
    };

let strCmp = (a, b) => a > b ? 1 : a < b ? -1 : 0;
let firstEl = el => Array.isArray(el) ? el[0] : el;
let sortOperation = (array, st_operation) => array;
// st_operation.nosort ? array :
// st_operation.compare ? array.sort((a,b)=> st_operation.compare(firstEl(a), firstEl(b))) : // custom compare operation
// array.sort((a,b)=>
//     typeof firstEl(a) === "number" && typeof firstEl(b) === "number" ? firstEl(a) - firstEl(b) :
//     // A binary string compare does not work. Performanance is very good so HEX is used..  localeCompare is another option.
//     Buffer.isBuffer(firstEl(a)) && Buffer.isBuffer(firstEl(b)) ? strCmp(firstEl(a).toString("hex"), firstEl(b).toString("hex")) :
//     strCmp(firstEl(a).toString(), firstEl(b).toString())
// )

export default Types;
