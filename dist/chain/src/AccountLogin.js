"use strict";

exports.__esModule = true;

var _PrivateKey = require("../../ecc/src/PrivateKey");

var _PrivateKey2 = _interopRequireDefault(_PrivateKey);

var _KeyUtils = require("../../ecc/src/KeyUtils");

var _KeyUtils2 = _interopRequireDefault(_KeyUtils);

var _state = require("./state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _keyCachePriv = {};
var _keyCachePub = {};

var AccountLogin = function () {
    function AccountLogin() {
        _classCallCheck(this, AccountLogin);

        var state = { loggedIn: false, roles: ["active", "owner", "memo"] };
        this.get = (0, _state.get)(state);
        this.set = (0, _state.set)(state);

        this.subs = {};
    }

    AccountLogin.prototype.addSubscription = function addSubscription(cb) {
        this.subs[cb] = cb;
    };

    AccountLogin.prototype.setRoles = function setRoles(roles) {
        this.set("roles", roles);
    };

    AccountLogin.prototype.generateKeys = function generateKeys(accountName, password, roles, prefix) {
        var start = new Date().getTime();
        if (!accountName || !password) {
            throw new Error("Account name or password required");
        }
        if (password.length < 12) {
            throw new Error("Password must have at least 12 characters");
        }

        var privKeys = {};
        var pubKeys = {};

        (roles || this.get("roles")).forEach(function (role) {
            var seed = accountName + role + password;
            var pkey = _keyCachePriv[seed] ? _keyCachePriv[seed] : _PrivateKey2.default.fromSeed(_KeyUtils2.default.normalize_brainKey(seed));
            _keyCachePriv[seed] = pkey;

            privKeys[role] = pkey;
            pubKeys[role] = _keyCachePub[seed] ? _keyCachePub[seed] : pkey.toPublicKey().toString(prefix);

            _keyCachePub[seed] = pubKeys[role];
        });

        return { privKeys: privKeys, pubKeys: pubKeys };
    };

    AccountLogin.prototype.checkKeys = function checkKeys(_ref) {
        var _this = this;

        var accountName = _ref.accountName,
            password = _ref.password,
            auths = _ref.auths;

        if (!accountName || !password || !auths) {
            throw new Error("checkKeys: Missing inputs");
        }
        var hasKey = false;

        var _loop = function _loop(role) {
            var _generateKeys = _this.generateKeys(accountName, password, [role]),
                privKeys = _generateKeys.privKeys,
                pubKeys = _generateKeys.pubKeys;

            auths[role].forEach(function (key) {
                if (key[0] === pubKeys[role]) {
                    hasKey = true;
                    _this.set(role, { priv: privKeys[role], pub: pubKeys[role] });
                }
            });
        };

        for (var role in auths) {
            _loop(role);
        };

        if (hasKey) {
            this.set("name", accountName);
        }

        this.set("loggedIn", hasKey);

        return hasKey;
    };

    AccountLogin.prototype.signTransaction = function signTransaction(tr) {
        var _this2 = this;

        var myKeys = {};
        var hasKey = false;

        this.get("roles").forEach(function (role) {
            var myKey = _this2.get(role);
            if (myKey) {
                hasKey = true;
                console.log("adding signer:", myKey.pub);
                tr.add_signer(myKey.priv, myKey.pub);
            }
        });

        if (!hasKey) {
            throw new Error("You do not have any private keys to sign this transaction");
        }
    };

    return AccountLogin;
}();

var accountLogin = new AccountLogin();

exports.default = accountLogin;
module.exports = exports["default"];