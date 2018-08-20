import {calcPubKeyRecoveryParam, recoverPubKey, sign, verify} from './ecdsa';
import {sha256} from './hash';
import {getCurveByName} from 'ecurve';
import assert from "assert";
import BigInteger from 'bigi';
import PublicKey from './PublicKey';

let secp256k1 = getCurveByName('secp256k1');

class Signature {

    constructor(r1, s1, i1) {
        this.r = r1;
        this.s = s1;
        this.i = i1;
        assert.equal(this.r != null, true, 'Missing parameter');
        assert.equal(this.s != null, true, 'Missing parameter');
        assert.equal(this.i != null, true, 'Missing parameter');
    }

    static fromBuffer(buf) {
        let i, r, s;
        assert.equal(buf.length, 65, 'Invalid signature length');
        i = buf.readUInt8(0);
        assert.equal(i - 27, i - 27 & 7, 'Invalid signature parameter');
        r = BigInteger.fromBuffer(buf.slice(1, 33));
        s = BigInteger.fromBuffer(buf.slice(33));
        return new Signature(r, s, i);
    };

    /**
     @param {Buffer} buf
     @param {PrivateKey} private_key
     @return {Signature}
     */
    static signBuffer(buf, private_key) {
        let _hash = sha256(buf);
        return Signature.signBufferSha256(_hash, private_key);
    }

    recoverPublicKeyFromBuffer(buffer) {
        return this.recoverPublicKey(sha256(buffer));
    };

    /** Sign a buffer of exactally 32 bytes in size (sha256(text))
     @param {Buffer} buf_sha256 - 32 bytes binary
     @param {PrivateKey} private_key
     @return {Signature}
     */
    static signBufferSha256(buf_sha256, private_key) {
        if (buf_sha256.length !== 32 || !Buffer.isBuffer(buf_sha256)) {
            throw new Error("buf_sha256: 32 byte buffer required");
        }
        let der, e, ecsignature, i, lenR, lenS, nonce;
        i = null;
        nonce = 0;
        e = BigInteger.fromBuffer(buf_sha256);
        while (true) {
            ecsignature = sign(secp256k1, buf_sha256, private_key.d, nonce++);
            der = ecsignature.toDER();
            lenR = der[3];
            lenS = der[5 + lenR];
            if (lenR === 32 && lenS === 32) {
                i = calcPubKeyRecoveryParam(secp256k1, e, ecsignature, private_key.toPublicKey().Q);
                i += 4;  // compressed
                i += 27; // compact  //  24 or 27 :( forcing odd-y 2nd key candidate)
                break;
            }
            if (nonce % 10 === 0 && process.env.ENVIRONMENT === 'DEV') {
                console.log("WARN: " + nonce + " attempts to find canonical signature");
            }
        }
        return new Signature(ecsignature.r, ecsignature.s, i);
    };

    static signHex(hex, private_key) {
        let buf = new Buffer(hex, 'hex');
        return Signature.signBuffer(buf, private_key);
    };

    toBuffer() {
        let buf;
        buf = new Buffer(65);
        buf.writeUInt8(this.i, 0);
        this.r.toBuffer(32).copy(buf, 1);
        this.s.toBuffer(32).copy(buf, 33);
        return buf;
    };

    static sign(string, private_key) {
        return Signature.signBuffer(new Buffer(string), private_key);
    };

    /**
     @return {PublicKey}
     */
    recoverPublicKey(sha256_buffer) {
        let Q, e, i;
        e = BigInteger.fromBuffer(sha256_buffer);
        i = this.i;
        i -= 27;
        i = i & 3;
        Q = recoverPubKey(secp256k1, e, this, i);
        return PublicKey.fromPoint(Q);
    };

    /**
     @param {Buffer} buf
     @param {./PublicKey} public_key
     @return {boolean}
     */
    verifyBuffer(buf, public_key) {
        let _hash = sha256(buf);
        return this.verifyHash(_hash, public_key);
    };


    /* <HEX> */

    verifyHash(hash, public_key) {
        assert.equal(hash.length, 32, "A SHA 256 should be 32 bytes long, instead got " + hash.length);
        return verify(secp256k1, hash, {
            r: this.r,
            s: this.s
        }, public_key.Q);
    };

    static fromHex(hex) {
        return Signature.fromBuffer(new Buffer(hex, "hex"));
    };

    toHex() {
        return this.toBuffer().toString("hex");
    };

    toByteBuffer() {
        let b = new ByteBuffer(ByteBuffer.DEFAULT_CAPACITY, ByteBuffer.LITTLE_ENDIAN);
        this.appendByteBuffer(b);
        return b.copy(0, b.offset);
    };

    verifyHex(hex, public_key) {
        let buf = new Buffer(hex, 'hex');
        return this.verifyBuffer(buf, public_key);
    };

}

export default Signature;
