import StellarSdk from "stellar-sdk";

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

export function signUriAndQuery(keypair, uri, query = {}) {
    return signText(
        keypair,
        textFromUriAndQuery(uri, query)
    );
}

export function signText(keypair, text = '') {
    return keypair.sign(text).toString('base64');
}

function textFromUriAndQuery (uri, query = {}) {
    return JSON.stringify({
        uri,
        query
    });
}