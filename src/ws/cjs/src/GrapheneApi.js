"use strict";

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

const GrapheneApi = function () {
    function GrapheneApi(ws_rpc, api_name) {
        _classCallCheck(this, GrapheneApi);

        this.ws_rpc = ws_rpc;
        this.api_name = api_name;
    }

    GrapheneApi.prototype.init = function init() {
        const self = this;
        return this.ws_rpc.call([1, this.api_name, []]).then(function (response) {
            self.api_id = response;
            return self;
        });
    };

    GrapheneApi.prototype.exec = function exec(method, params) {
        return this.ws_rpc.call([this.api_id, method, params]).catch(function (error) {
            if (process.env.ENVIRONMENT === 'DEV') {
                console.log("!!! GrapheneApi error: ", method, params, error, JSON.stringify(error));
            }
            throw error;
        });
    };

    return GrapheneApi;
}();

exports.default = GrapheneApi;
module.exports = exports["default"];