"use strict";

exports.__esModule = true;

const MAX_RETRY_COUNT = 2;

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

let webSocket = null;
const ReconnectingWebSocketBrowser = require("ReconnectingWebSocket");
const ReconnectingWebSocketNode = require("reconnecting-websocket");
if (typeof WebSocket === "undefined" && !process.env.browser) {
    webSocket = require("ws");
} else {
    webSocket = WebSocket
}
let WebSocketClient = null;
if (typeof ReconnectingWebSocketBrowser === 'undefined' && !process.env.browser) {
    WebSocketClient = ReconnectingWebSocketNode;
} else {
    WebSocketClient = ReconnectingWebSocketBrowser;
}

let ChainWebSocket = function () {
    function ChainWebSocket(ws_server, statusCb) {
        const _this = this;
        this.SOCKET_DEBUG = process.env.WS_ENV === 'DEV';
        _classCallCheck(this, ChainWebSocket);

        this.statusCb = statusCb;

        const options = {
            WebSocket: webSocket,
            maxRetries: MAX_RETRY_COUNT,
            maxReconnectAttempts: MAX_RETRY_COUNT,
            connectionTimeout: 3000,
            timeoutInterval: 3000,
            reconnectInterval: 1000,
            debug: this.SOCKET_DEBUG
        };

        try {
            this.ws = new WebSocketClient(ws_server, [], options);
        } catch (error) {
            console.error("invalid websocket URL:", error);
            if (process.env.WS_ENV === 'DEV') {
                console.error("invalid websocket URL:", error);
            }
            this.ws = new WebSocketClient("wss://127.0.0.1:8080");
        }

        this.current_reject = null;
        this.on_reconnect = null;
        this.connect_promise = new Promise(function (resolve, reject) {
            _this.current_reject = reject;
            _this.ws.addEventListener('open', function () {
                if (_this.statusCb) _this.statusCb("open");
                if (_this.on_reconnect) _this.on_reconnect();
                resolve();
            });
            _this.ws.addEventListener('error', function (error) {
                if (_this.statusCb) _this.statusCb("error");
                if (_this.current_reject) {
                    if ((_this.ws.reconnectAttempts || _this.ws.retryCount) >= MAX_RETRY_COUNT) {
                        _this.current_reject(new Error('Error connecting ws', error.stack));
                        return;
                    }
                }
            })
            _this.ws.addEventListener('message', function (message) {
                return _this.listener(JSON.parse(message.data));
            })
            _this.ws.addEventListener('close', function () {
                if (_this.statusCb) _this.statusCb("closed");
            })
        });
        this.cbId = 0;
        this.cbs = {};
        this.subs = {};
        this.unsub = {};
    }

    ChainWebSocket.prototype.refreshConnection = function() {
        if (this.SOCKET_DEBUG) {
            console.log('debug:dcorejs-lib => refreshing connection');
        }
        if (typeof this.ws.refresh === undefined) { 
            this.ws.refresh();
        } else {
            this.ws.reconnect()
        }
    }

    ChainWebSocket.prototype.call = function call(params) {
        const _this2 = this;
        return new Promise(function (resolve, reject) {
            _this2.connect_promise
                .then(res => {
                    const method = params[1];
                    _this2.cbId += 1;

                    if (method === "set_subscribe_callback" || method === "subscribe_to_market" || method === "broadcast_transaction_with_callback" || method === "set_pending_transaction_callback" || method === "set_block_applied_callback") {
                        // Store callback in subs map
                        _this2.subs[_this2.cbId] = {
                            callback: params[2][0]
                        };

                        // Replace callback with the callback id
                        params[2][0] = _this2.cbId;
                    }

                    if (method === "unsubscribe_from_market" || method === "unsubscribe_from_accounts") {
                        if (typeof params[2][0] !== "function") {
                            throw new Error("First parameter of unsub must be the original callback");
                        }

                        const unSubCb = params[2].splice(0, 1)[0];

                        // Find the corresponding subscription
                        for (let id in _this2.subs) {
                            if (_this2.subs[id].callback === unSubCb) {
                                _this2.unsub[this.cbId] = id;
                                break;
                            }
                        }
                    }

                    const request = {
                        method: "call",
                        params: params
                    };
                    request.id = _this2.cbId;

                    _this2.cbs[_this2.cbId] = {
                        time: new Date(),
                        resolve: resolve,
                        reject: reject
                    };
                    _this2.ws.onerror = function (error) {
                        if (process.env.WS_ENV === 'DEV') {
                            console.log("!!! ChainWebSocket Error ", error);
                        }
                        reject(error);
                    };
                    _this2.ws.send(JSON.stringify(request));
                })
                .catch(err => reject(err));
        });
    };

    ChainWebSocket.prototype.listener = function listener(response) {
        let sub = false,
            callback = null;

        if (response.method === "notice") {
            sub = true;
            response.id = response.params[0];
        }

        if (!sub) {
            callback = this.cbs[response.id];
        } else {
            callback = this.subs[response.id].callback;
        }

        if (callback && !sub) {
            if (response.error) {
                callback.reject(response.error);
            } else {
                callback.resolve(response.result);
            }
            delete this.cbs[response.id];

            if (this.unsub[response.id]) {
                delete this.subs[this.unsub[response.id]];
                delete this.unsub[response.id];
            }
        } else if (callback && sub) {
            callback(response.params[1]);
        } else {
            if (process.env.WS_ENV === 'DEV') {
                console.log("Warning: unknown websocket response: ", response);
            }
        }
    };

    ChainWebSocket.prototype.login = function login(user, password) {
        const _this3 = this;

        return this.connect_promise
            .then(function () {
                return _this3.call([1, "login", [user, password]]);
            });
    };

    ChainWebSocket.prototype.close = function close() {
        this.ws.close();
    };

    return ChainWebSocket;
}();

exports.default = ChainWebSocket;
module.exports = exports["default"];
