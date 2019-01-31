"use strict";exports.__esModule = true;exports.



signResponsePayload = signResponsePayload;exports.








signPayload = signPayload;exports.







signUriAndQuery = signUriAndQuery;exports.






signText = signText;exports.



verifyJWT = verifyJWT;exports.










































jwtClaims = jwtClaims;exports.










verifyPayloadSignature = verifyPayloadSignature;exports.








verifyUriAndQuerySignature = verifyUriAndQuerySignature;var _stellarSdk = require("stellar-sdk");var _stellarSdk2 = _interopRequireDefault(_stellarSdk);var _jsonwebtoken = require("jsonwebtoken");var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);var _moment = require("moment");var _moment2 = _interopRequireDefault(_moment);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function signResponsePayload(keypair, request, response, payload) {if (request.query.nonce) {const signature = signPayload(keypair, request.query.nonce, payload);response.set('Signature', signature);}return response;}function signPayload(keypair, nonce, payload) {const toSign = { nonce, payload };return signText(keypair, JSON.stringify(toSign));}function signUriAndQuery(keypair, uri, query = {}) {return signText(keypair, textFromUriAndQuery(uri, query));}function signText(keypair, text = '') {return keypair.sign(text).toString('base64');}async function verifyJWT(token, publicKey, options = {}) {let payload = null;try {payload = await jwtClaims(token, publicKey);} catch (err) {return { verified: false, message: err.message || 'Could not verify jwt.' };}if (options.iss) {if (!payload.iss || payload.iss !== options.iss) {return { verified: false, message: 'Invalid token issuer.' };}}if (options.account) {if (!payload.sub || payload.sub !== options.account) {return { verified: false, message: 'Token subject does not match account.' };}}if ((0, _moment2.default)().isAfter(_moment2.default.unix(payload.exp))) {return { verified: false, message: 'Your login access has expired. Please request a new token.' };}return { verified: true, claims: payload };}async function jwtClaims(token, publicKey) {return new Promise((resolve, reject) => {_jsonwebtoken2.default.verify(token, publicKey, { algorithms: ['RS256'] }, function (err, payload) {if (err) {return reject(err);}resolve(payload);});});}function verifyPayloadSignature(signature, payload, nonce, pubKey) {const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);const signed = { nonce, payload };return keypair.verify(JSON.stringify(signed), Buffer.from(signature, 'base64'));}function verifyUriAndQuerySignature(signature, pubKey, uri, query = {}) {
    const keypair = _stellarSdk2.default.Keypair.fromPublicKey(pubKey);
    return keypair.verify(textFromUriAndQuery(uri, query), Buffer.from(signature, 'base64'));
}

function textFromUriAndQuery(uri, query = {}) {
    return uri.replace(/https?:\/\//g, '') + '?' + Object.keys(query).filter(k => !!query[k]).sort().map(k => k + '=' + query[k]).join('&');
}