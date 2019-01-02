"use strict";exports.__esModule = true;exports.TokenProvider = undefined;var _moment = require("moment");var _moment2 = _interopRequireDefault(_moment);
var _requestPromiseNative = require("request-promise-native");var _requestPromiseNative2 = _interopRequireDefault(_requestPromiseNative);
var _stellarSdk = require("stellar-sdk");var _stellarSdk2 = _interopRequireDefault(_stellarSdk);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}let

TokenProvider = exports.TokenProvider = class TokenProvider {
    get cachedTokenIsValid() {
        if (!this._token) {
            return false;
        }

        // Token is cached and not yet expired
        return (0, _moment2.default)().isBefore(_moment2.default.unix(parseInt(this._token.exp, 10)));
    }

    constructor(a3s, keypair) {
        this.a3s = a3s;
        this.keypair = keypair;
    }

    async token(issuer) {
        if (!this.cachedTokenIsValid) {
            await this.fetchToken(issuer);
        }
        return this._token.token;
    }

    async fetchToken(issuer) {
        const account = this.keypair.publicKey();
        const uri = this.a3s.config.host + '/' + issuer + '/Authentication';
        const qs = { account };

        const challengeResponse = await (0, _requestPromiseNative2.default)({
            method: 'GET',
            uri,
            qs,
            json: true });


        let transaction = new _stellarSdk2.default.Transaction(challengeResponse.transaction);
        transaction.sign(this.keypair);

        const tokenResponse = await (0, _requestPromiseNative2.default)({
            method: 'POST',
            uri,
            qs,
            json: true,
            body: {
                transaction: transaction.toEnvelope().toXDR('base64') } });



        if (!tokenResponse || !tokenResponse.token) {
            return null;
        }

        const token = tokenResponse.token;

        this._token = {
            token,
            exp: this.parseJwt(token).exp };


        return token;
    }

    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(this.atob(base64));
    }

    atob(b64string) {
        return new Buffer(b64string, 'base64').toString('binary');
    }};