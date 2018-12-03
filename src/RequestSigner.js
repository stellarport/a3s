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
     * @param request
     * @param response
     */
    sign(request, response) {
        if (request.query.nonce && response.body) {
            const toSign = {
                nonce: req.query.nonce,
                payload: response.body
            };
            const signature = this.keypair.sign(JSON.stringify(toSign)).toString('base64');
            response.set('Signature', signature);
        }

        return response;
    }
}