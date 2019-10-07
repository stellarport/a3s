import jwt from 'jsonwebtoken';
import moment from 'moment';
import rpn from 'request-promise-native';
import randomstring from 'randomstring';
import {verifyPayloadSignature, verifyUriAndQuerySignature, signText, signUriAndQuery, signPayload, signResponsePayload, verifyJWT} from "./utils";

export class ConnectionManager {
    constructor(a3s, keypair) {
        this.a3s = a3s;
        this.keypair = keypair;
    }

    signPayload(nonce, payload) {
        return signPayload(this.keypair, nonce, payload);
    }

    signResponsePayload(request, response, payload) {
        return signResponsePayload(this.keypair, request, response, payload);
    }

    signUriAndQuery(uri, query = {}) {
        return signUriAndQuery(this.keypair, uri, query)
    }

    signText(text = '') {
        return signText(this.keypair, text);
    }

    async verifyRequestJWTByAccount(req, account, options = {}) {
        if (!account) {
            return {
                verified: false,
                message: 'Account is required.'
            }
        }

        return this.verifyRequestJWT(req, {
            ...options,
            account
        });
    }

    async verifyRequestJWT(req, options = {}) {
        if (!req.headers.authorization) {
            return {
                verified: false,
                message: 'Please make sure your request has an Authorization header.'
            }
        }

        const token = req.headers.authorization.split(' ')[1];
        const result = await this.verifyJWT(token, options);

        if (!result.verified) {
            return result;
        }

        req.jwt = token;
        req.jwtClaims = result.claims;

        return result;
    }

    async verifyJWT(token, options = {}) {
        return verifyJWT(
            token,
            options.jwtPublicKey || this.a3s.config.jwt.rsaPublicKey,
            {
                iss: options.jwtPublicKey ? null :this.a3s.config.jwt.iss,
                account: options.account
            }
        );
    }

    /**
     * @deprecated
     */
    async verifyRequestByJWT(req, options = {}) {
        if (!req.headers.authorization) {
            return {
                verified: false,
                message: 'Please make sure your request has an Authorization header.'
            }
        }
        const token = req.headers.authorization.split(' ')[1];
        const account = options.strict ? options.account : options.account || req.query.account || req.body.account;

        if (!account) {
            return {
                verified: false,
                message: 'Account is required.'
            }
        }

        return this.verifyJWT(token, account, {
            jwtPublicKey: options.jwtPublicKey
        });
    }

    async verifyRequestByUriAndQuerySignature(req) {
        if (!req.headers.signature) {
            return {
                verified: false,
                message: 'Please make sure your request has an Signature header.'
            }
        }

        return this.verifyUriAndQuerySignature(req.headers.signature || '', req.get('host') + req.path, req.query);
    }

    async verifyUriAndQuerySignature(signature, uri, query = {}) {
        const verified = verifyUriAndQuerySignature(signature, this.a3s.config.requestSigningPublicKey, uri, query);
        return {
            verified,
            message: verified ? undefined : 'Unable to verify signature.'
        }
    }

    /**
     *
     * @param uri
     * @param [options]
     * @param {Object} [options.query] query parameters to send
     * @param {string} [options.method='GET'] http method
     * @returns {Promise<void>}
     * @private
     */
    async fetchAndVerify(uri, options = {}) {
        const self = this;
        const nonce = randomstring.generate(20);

        options.query = {
            ...(options.query || {}),
            nonce
        };

        options.transform = function (body, response, resolveWithFullResponse) {
            if (response.statusCode !== 200 || !body) {
                return body;
            }

            if (!response.headers.signature || !verifyPayloadSignature(response.headers.signature, body, nonce, self.a3s.config.requestSigningPublicKey)) {
                return null;
            }
            return body;
        };

        return this.fetch(uri, options);
    }

    /**
     * Fetches from A3S
     * @param uri
     * @param [options]
     * @param {Object} [options.query] query parameters to send
     * @param {string} [options.method='GET'] http method
     * @param {function} [options.transform] response transformation function
     * @returns {Promise<void>}
     */
    async fetch(uri, options = {}) {
        const requestParams = {
            method: options.method || 'GET',
            uri,
            qs: options.query,
            json: true,
            transform: options.transform
        };

        if (this.a3s.clientType === 'relay') {
            requestParams.headers = {
                'Signature': this.signUriAndQuery(uri, options.query)
            };

            if (this.a3s.rateLimitKey) {
                requestParams.headers['x-rate-limit-key'] = this.a3s.rateLimitKey;
            }
        }
        else if (this.a3s.clientType === 'account') {
            const splitUri = uri.split('/');
            const issuer = splitUri[splitUri.length - 2];
            const token = await this.a3s.tokenProvider.token(issuer);

            requestParams.headers = {
                'Authorization': 'Bearer ' + token
            };
        }

        return rpn(requestParams);
    }
}