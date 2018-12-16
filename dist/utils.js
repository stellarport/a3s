'use strict';exports.__esModule = true;exports.

verifyPayloadSignature = verifyPayloadSignature;exports.









verifyUriSignature = verifyUriSignature;var _stellarSdk = require('stellar-sdk');var _stellarSdk2 = _interopRequireDefault(_stellarSdk);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function verifyPayloadSignature(signature, payload, nonce, pubKey) {pubKey = pubKey || this.a3s.config.requestSigningPublicKey;const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);const signed = { nonce, payload };return keypair.verify(JSON.stringify(signed), Buffer.from(signature, 'base64'));}function verifyUriSignature(signature, fullUri, pubKey) {
    pubKey = pubKey || this.a3s.config.requestSigningPublicKey;
    const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);
    return keypair.verify(fullUri, Buffer.from(signature, 'base64'));
}