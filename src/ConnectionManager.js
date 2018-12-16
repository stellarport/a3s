import StellarSdk from "stellar-sdk";
import jwt from 'jsonwebtoken';
import moment from 'moment';

export class ConnectionManager {
    constructor(a3s, requestSigningSecretKey) {
        this.a3s = a3s;
        this.keypair = StellarSdk.Keypair.fromSecret(requestSigningSecretKey);
    }

    /**
     * Sets the signature header on a response, corresponding to a payload.
     * @param request
     * @param response
     * @param payload
     */
    signResponsePayload(request, response, payload) {
        if (request.query.nonce) {
            const toSign = {
                nonce: request.query.nonce,
                payload
            };
            const signature = this.signText(JSON.stringify(toSign));
            response.set('Signature', signature);
        }

        return response;
    }

    signUriAndQuery(uri, query = {}) {
        return this.signText(
            uri + Object.keys(query).reduce((result, key) => {
                if (!query[key]) {
                    return result;
                }
                if (result !== '?') {
                    result += '&';
                }
                return result + key + '=' + query[key];
            }, '?')
        );
    }

    /**
     * @param text
     */
    signText(text = '') {
        return this.keypair.sign(text).toString('base64');
    }

    async verifyRequest(req, options = {}) {
        if (!req.headers.authorization) {
            return {
                verified: false,
                message: 'Please make sure your request has an Authorization header.'
            }
        }
        const token = req.headers.authorization.split(' ')[1];
        const account = options.account || req.query.account;

        if (!account) {
            return {
                verified: false,
                message: 'Account is required.'
            }
        }

        return this.verifyToken(token, account);
    }

    async verifyToken(token, account) {
        let payload = null;
        try {
            payload = new Promise((resolve, reject) => {
                jwt.verify(token, this.this.a3s.config.rsaPublicKey, { algorithms: ['RS256'] }, function (err, payload) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(payload);
                });
            })
        }
        catch (err) {
            return {
                verified: false,
                message: 'Could not verify jwt.'
            }
        }

        if (!payload.iss || payload.iss !== this.a3s.config.iss) {
            return {
                verified: false,
                message: 'Invalid token issuer.'
            }
        }

        if (!payload.sub || payload.sub !== account) {
            return {
                verified: false,
                message: 'Token subject does not match account.'
            }
        }

        if (moment().isAfter(payload.exp)) {
            return {
                verified: false,
                message: 'Your login access has expired. Please request a new token.'
            }
        }

        return {
            verified: true
        }
    }
}