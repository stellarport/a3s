'use strict';exports.__esModule = true;exports.

verifyPayloadSignature = verifyPayloadSignature;exports.








verifyUriAndQuerySignature = verifyUriAndQuerySignature;exports.




signUriAndQuery = signUriAndQuery;exports.






signText = signText;var _stellarSdk = require('stellar-sdk');var _stellarSdk2 = _interopRequireDefault(_stellarSdk);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function verifyPayloadSignature(signature, payload, nonce, pubKey) {const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);const signed = { nonce, payload };return keypair.verify(JSON.stringify(signed), Buffer.from(signature, 'base64'));}function verifyUriAndQuerySignature(signature, pubKey, uri, query = {}) {const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);return keypair.verify(textFromUriAndQuery(uri, query), Buffer.from(signature, 'base64'));}function signUriAndQuery(keypair, uri, query = {}) {return signText(keypair, textFromUriAndQuery(uri, query));}function signText(keypair, text = '') {
    return keypair.sign(text).toString('base64');
}

function textFromUriAndQuery(uri, query = {}) {
    return JSON.stringify({
        uri,
        query });

}