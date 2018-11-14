'use strict';exports.__esModule = true;exports.RequestSigner = undefined;var _stellarSdk = require('stellar-sdk');var _stellarSdk2 = _interopRequireDefault(_stellarSdk);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}let

RequestSigner = exports.RequestSigner = class RequestSigner {
    /**
                                                              * Creates a new RequestSigner
                                                              * @param {StellarSdk.Keypair} secretKey
                                                              */
    constructor(secretKey) {
        this.keypair = _stellarSdk2.default.Keypair.fromSecret(secretKey);
    }

    /**
       * Sets the signature header on a response, corresponding to a payload.
       * @param payload
       * @param response
       */
    sign(payload, response) {
        if (payload) {
            const signature = signingKeypair.sign(JSON.stringify(payload)).toString('base64');
            response.set('Signature', signature);
        }

        return response;
    }};