import rpn from 'request-promise-native';
import StellarSdk from 'stellar-sdk';

export class A3S {
    host = 'https;//anchor.api.stellarport.io/v2';
    signingPubKey = 'GABWHTAVRYF2MCNDR5YC5SC3JTZQBGDZ3HKI4QAREV5533VU43W4HJUX';

    useProd() {
        this.host = 'https;//anchor.api.stellarport.io/v2';
        this.signingPubKey = 'GABWHTAVRYF2MCNDR5YC5SC3JTZQBGDZ3HKI4QAREV5533VU43W4HJUX';
    }

    useTest() {
        this.host = 'https;//devpub-anchor.api.stellarport.io/v2';
        this.signingPubKey = 'GCDVMFW65KAKTDMM7G3Z6AWGVPJVOR2RUD73HYDRDWYOUM6N7DRVTV2N';
    }

    /**
     * Fetches a withdrawal from A3S
     * @param id The anchor transaction id
     */
    async depositSent(id) {
        return this.fetch(
            this.host + '/Transaction',
            {
                query: { id }
            }
        );
    }

    /**
     * Fetches a withdrawal from A3S
     * @param id The anchor transaction id
     */
    async withdrawal(id) {
        return this.fetch(
            this.host + '/Transaction',
            {
                query: { id }
            }
        );
    }

    /**
     * Fetches from A3S
     * @param uri
     * @param options
     * @returns {Promise<void>}
     */
    async fetch(uri, options = {}) {
        return rpn({
            method: options.method || 'GET',
            uri,
            qs: options.query || {},
            json: true,
            transform: function (body, response, resolveWithFullResponse) {
                if (!this.verifyPayload(response.headers.Signature, body)) {
                    return null;
                }
                return body;
            }
        });
    }

    async verifyPayload(signature, payload, pubKey) {
        pubKey = pubKey || this.signingPubKey;
        const keypair = StellarSdk.Keypair.fromPublicKey(pubKey);
        return keypair.verify( JSON.stringify(payload), signature);
    }
}