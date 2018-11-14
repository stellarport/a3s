import StellarSdk from "stellar-sdk";

export class RequestSigner {
    /**
     * Creates a new RequestSigner
     * @param {StellarSdk.Keypair} secretKey
     */
    constructor(secretKey) {
        this.keypair = StellarSdk.Keypair.fromSecret(secretKey);
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
    }
}