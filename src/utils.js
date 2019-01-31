import StellarSdk from "stellar-sdk";
import jwt from "jsonwebtoken";
import moment from "moment";

export function signResponsePayload(keypair, request, response, payload) {
    if (request.query.nonce) {
        const signature = signPayload(keypair, request.query.nonce, payload);
        response.set('Signature', signature);
    }

    return response;
}

export function signPayload(keypair, nonce, payload) {
    const toSign = {
        nonce,
        payload
    };
    return signText(keypair, JSON.stringify(toSign));
}

export function signUriAndQuery(keypair, uri, query = {}) {
    return signText(
        keypair,
        textFromUriAndQuery(uri, query)
    );
}

export function signText(keypair, text = '') {
    return keypair.sign(text).toString('base64');
}

export async function verifyJWT(token, account, publicKey, options = {}) {
    let payload = null;
    try {
        payload = await jwtClaims(token, publicKey);
    }
    catch (err) {
        return {
            verified: false,
            message: err.message || 'Could not verify jwt.'
        }
    }

    if (options.iss) {
        if (!payload.iss || payload.iss !== options.iss) {
            return {
                verified: false,
                message: 'Invalid token issuer.'
            }
        }
    }

    if (!payload.sub || payload.sub !== account) {
        return {
            verified: false,
            message: 'Token subject does not match account.'
        }
    }

    if (moment().isAfter(moment.unix(payload.exp))) {
        return {
            verified: false,
            message: 'Your login access has expired. Please request a new token.'
        }
    }

    return {
        verified: true
    }
}

export async function jwtClaims(token, publicKey) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, function (err, payload) {
            if (err) {
                return reject(err);
            }
            resolve(payload);
        });
    });
}

export function verifyPayloadSignature(signature, payload, nonce, pubKey) {
    const keypair = StellarSdk.Keypair.fromPublicKey(pubKey);
    const signed = {
        nonce,
        payload
    };
    return keypair.verify(JSON.stringify(signed), Buffer.from(signature, 'base64'));
}

export function verifyUriAndQuerySignature(signature, pubKey, uri, query = {}) {
    const keypair = StellarSdk.Keypair.fromPublicKey(pubKey);
    return keypair.verify(textFromUriAndQuery(uri, query), Buffer.from(signature, 'base64'));
}

function textFromUriAndQuery (uri, query = {}) {
    return uri.replace(/https?:\/\//g, '') + '?' + Object.keys(query).filter(k => !!query[k]).sort().map(k => k + '=' + query[k]).join('&');
}