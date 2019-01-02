import moment from 'moment';
import rpn from "request-promise-native";
import StellarSdk from "stellar-sdk";

export class TokenProvider {
    get cachedTokenIsValid() {
        if (!this._token) {
            return false;
        }

        // Token is cached and not yet expired
        return moment().isBefore(moment.unix(parseInt(this._token.exp, 10)));
    }

    constructor(a3s, keypair) {
        this.a3s = a3s;
        this.keypair = keypair;
    }

    async token(issuer) {
        if (!this.cachedTokenIsValid) {
            await this.fetchToken(issuer);
        }
        return this._token.token;
    }

    async fetchToken(issuer) {
        const account = this.keypair.publicKey();
        const uri = this.a3s.config.host + '/' + issuer + '/Authentication';
        const qs = {account};

        const challengeResponse = await rpn({
            method:  'GET',
            uri,
            qs,
            json: true
        });

        let transaction = new StellarSdk.Transaction(challengeResponse.transaction);
        let signedTransaction = transaction.sign(this.keypair);

        const tokenResponse = await rpn({
            method:  'POST',
            uri,
            qs,
            json: true,
            body: {
                transaction: signedTransaction.toEnvelope().toXDR('base64')
            }
        });

        if (!tokenResponse || !tokenResponse.token) {
            return null;
        }

        const token = tokenResponse.token;

        this._token = {
            token,
            exp: this.parseJwt(token).exp
        };

        return token;
    }

    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    }
}