import rpn from "request-promise-native";

export class TokenProvider {
    tokenMap = {};

    constructor(a3s, keypair) {
        this.a3s = a3s;
        this.keypair = keypair;
    }

    async token(account, issuer) {
        let token = this.tokenMap[account + issuer];
        if (token) {
            return token;
        }
        return this.fetchToken;
    }

    async fetchToken(account, issuer) {
        const uri = '/Authentication' + '/' + issuer;
        const qs = {account};

        const challengeResponse = await rpn({
            method:  'GET',
            uri,
            qs,
            json: true
        });

        let signedTransaction = (new StellarSdk.Transaction(challengeResponse.transaction)).sign(this.keypair);

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

        this.tokenMap[account + issuer] = {
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