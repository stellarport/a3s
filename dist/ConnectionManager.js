'use strict';exports.__esModule = true;exports.ConnectionManager = undefined;var _jsonwebtoken = require('jsonwebtoken');var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);
var _moment = require('moment');var _moment2 = _interopRequireDefault(_moment);
var _requestPromiseNative = require('request-promise-native');var _requestPromiseNative2 = _interopRequireDefault(_requestPromiseNative);
var _stellarSdk = require('stellar-sdk');var _stellarSdk2 = _interopRequireDefault(_stellarSdk);
var _randomstring = require('randomstring');var _randomstring2 = _interopRequireDefault(_randomstring);
var _utils = require('./utils');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}let

ConnectionManager = exports.ConnectionManager = class ConnectionManager {
    constructor(a3s, requestSigningSecretKey) {
        this.a3s = a3s;
        this.keypair = _stellarSdk2.default.Keypair.fromSecret(requestSigningSecretKey);
    }

    signPayload(nonce, payload) {
        return (0, _utils.signPayload)(this.keypair, nonce, payload);
    }

    signResponsePayload(request, response, payload) {
        return (0, _utils.signResponsePayload)(this.keypair, request, response, payload);
    }

    signUriAndQuery(uri, query = {}) {
        return (0, _utils.signUriAndQuery)(this.keypair, uri, query);
    }

    signText(text = '') {
        return (0, _utils.signText)(this.keypair, text);
    }

    async verifyRequestByJWT(req, options = {}) {
        if (!req.headers.authorization) {
            return {
                verified: false,
                message: 'Please make sure your request has an Authorization header.' };

        }
        const token = req.headers.authorization.split(' ')[1];
        const account = options.account || req.query.account || req.body.account;

        if (!account) {
            return {
                verified: false,
                message: 'Account is required.' };

        }

        return this.verifyJWT(token, account);
    }

    async verifyRequestByUriAndQuerySignature(req) {
        if (!req.headers.signature) {
            return {
                verified: false,
                message: 'Please make sure your request has an Signature header.' };

        }

        return this.verifyUriAndQuerySignature(req.headers.signature || '', req.protocol + '://' + req.get('host') + req.path, req.query);
    }

    async verifyUriAndQuerySignature(signature, uri, query = {}) {
        const verified = (0, _utils.verifyUriAndQuerySignature)(signature, this.a3s.config.requestSigningPublicKey, uri, query);
        return {
            verified,
            message: verified ? undefined : 'Unable to verify signature.' };

    }

    async verifyJWT(token, account) {
        let payload = null;
        try {
            payload = await new Promise((resolve, reject) => {
                _jsonwebtoken2.default.verify(token, this.a3s.config.jwt.rsaPublicKey, { algorithms: ['RS256'] }, function (err, payload) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(payload);
                });
            });
        }
        catch (err) {
            return {
                verified: false,
                message: err.message || 'Could not verify jwt.' };

        }

        if (!payload.iss || payload.iss !== this.a3s.config.jwt.iss) {
            return {
                verified: false,
                message: 'Invalid token issuer.' };

        }

        if (!payload.sub || payload.sub !== account) {
            return {
                verified: false,
                message: 'Token subject does not match account.' };

        }

        if ((0, _moment2.default)().isAfter(_moment2.default.unix(payload.exp))) {
            return {
                verified: false,
                message: 'Your login access has expired. Please request a new token.' };

        }

        return {
            verified: true };

    }

    /**
       *
       * @param uri
       * @param [options]
       * @param {Object} [options.query] query parameters to send
       * @param {string} [options.method='GET'] http method
       * @returns {Promise<void>}
       * @private
       */
    async fetchAndVerify(uri, options = {}) {
        const self = this;
        const nonce = _randomstring2.default.generate(20);

        options.query = {
            ...(options.query || {}),
            nonce };


        options.transform = function (body, response, resolveWithFullResponse) {
            if (response.statusCode !== 200 || !body) {
                return body;
            }

            if (!response.headers.signature || !(0, _utils.verifyPayloadSignature)(response.headers.signature, body, nonce, self.a3s.config.requestSigningPublicKey)) {
                return null;
            }
            return body;
        };

        return this.fetch(uri, options);
    }

    /**
       * Fetches from A3S
       * @param uri
       * @param [options]
       * @param {Object} [options.query] query parameters to send
       * @param {string} [options.method='GET'] http method
       * @param {function} [options.transform] response transformation function
       * @returns {Promise<void>}
       */
    async fetch(uri, options = {}) {
        return (0, _requestPromiseNative2.default)({
            method: options.method || 'GET',
            uri,
            qs: options.query,
            json: true,
            transform: options.transform,
            headers: {
                'Signature': this.signUriAndQuery(uri, options.query) } });


    }};