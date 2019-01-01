'use strict';exports.__esModule = true;exports.

signResponsePayload = signResponsePayload;exports.








signPayload = signPayload;exports.







signUriAndQuery = signUriAndQuery;exports.






signText = signText;exports.



verifyPayloadSignature = verifyPayloadSignature;exports.








verifyUriAndQuerySignature = verifyUriAndQuerySignature;var _stellarSdk = require('stellar-sdk');var _stellarSdk2 = _interopRequireDefault(_stellarSdk);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function signResponsePayload(keypair, request, response, payload) {if (request.query.nonce) {const signature = signPayload(keypair, request.query.nonce, payload);response.set('Signature', signature);}return response;}function signPayload(keypair, nonce, payload) {const toSign = { nonce, payload };return signText(keypair, JSON.stringify(toSign));}function signUriAndQuery(keypair, uri, query = {}) {return signText(keypair, textFromUriAndQuery(uri, query));}function signText(keypair, text = '') {return keypair.sign(text).toString('base64');}function verifyPayloadSignature(signature, payload, nonce, pubKey) {const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);const signed = { nonce, payload };return keypair.verify(JSON.stringify(signed), Buffer.from(signature, 'base64'));}function verifyUriAndQuerySignature(signature, pubKey, uri, query = {}) {
    const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);
    return keypair.verify(textFromUriAndQuery(uri, query), Buffer.from(signature, 'base64'));
}

function textFromUriAndQuery(uri, query = {}) {
    return uri.replace(/https?:\/\//g) + '?' + Object.keys(query).filter(k => !!query[k]).sort().map(k => k + '=' + query[k]).join('&');
}