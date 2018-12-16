import StellarSdk from "stellar-sdk";

export function verifyPayloadSignature(signature, payload, nonce, pubKey) {
    pubKey = pubKey || this.a3s.config.requestSigningPublicKey;
    const keypair = StellarSdk.Keypair.fromPublicKey(pubKey);
    const signed = {
        nonce,
        payload
    };
    return keypair.verify(JSON.stringify(signed), Buffer.from(signature, 'base64'));
}

export function verifyUriSignature(signature, fullUri, pubKey) {
    pubKey = pubKey || this.a3s.config.requestSigningPublicKey;
    const keypair = StellarSdk.Keypair.fromPublicKey(pubKey);
    return keypair.verify(fullUri, Buffer.from(signature, 'base64'));
}