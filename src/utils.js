import StellarSdk from "stellar-sdk";

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
    return uri.replace(/https?:\/\//g) + '?' + Object.keys(query).filter(k => !!query[k]).sort().map(k => k + '=' + query[k]).join('&');
}