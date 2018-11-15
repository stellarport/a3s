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
     * Fetches info from A3S regarding what assets are available
     * @returns {Promise<Object>}
     */
    async info(asset_issuer) {
        return this._fetchAndVerify(this.host + '/' + asset_issuer + '/Info');
    }

    /**
     * Fetches a list of transactions
     * @param {string} asset_code the desired asset code
     * @param {string} asset_issuer the issuing account id
     * @param {string} account the desired account (stellar public key)
     * @param [options]
     * @param {Date|string} [options.no_older_than]
     * @param {number} [options.limit]
     * @param {string} [options.paging_id]
     * @returns {Promise<Object>}
     */
    async transactions(asset_code, asset_issuer, account, options) {
        return this._fetchAndVerify(
            this.host + '/' + asset_issuer + '/Transactions',
            {
                query: {
                    asset_code,
                    account,
                    ...options
                }
            }
        )
    }

    /**
     * Fetches a specific transaction. One of id, stellar_transaction_id or external_transaction_id must be specified.
     * @param [options]
     * @param {number} [options.id]
     * @param {string} [options.stellar_transaction_id]
     * @param {string} [options.external_transaction_id]
     * @returns {Promise<Object>}
     */
    async transaction(asset_issuer, options) {
        if (!options.id && !options.stellar_transaction_id && !options.external_transaction_id) {
            throw new Error('id or stellar_transaction_id or external_transaction_id is required by transaction()');
        }

        const payload = await this._fetchAndVerify(
            this.host + '/' + asset_issuer + '/Transaction',
            {
                query: {
                    ...options
                }
            }
        );

        if (payload.transaction.id.toString() !== id.toString()) {
            return null;
        }

        return payload;
    }

    /**
     * Fetches a deposit from A3S
     * @param id The anchor transaction id
     * @returns {Promise<Object>}
     */
    async deposit(asset_issuer, id) {
        const payload = await this.transaction({id});

        if (payload.transaction.kind !== 'deposit') {
            return null;
        }

        return {
            deposit: payload.transaction
        };
    }

    /**
     * Informs A3S that a deposit has been sent by a customer to the relay server. The deposit may or may not be confirmed. A3S will verify this with the relay server before continuing.
     * @param {string} reference
     * @param {string} asset_code
     * @param {string} asset_issuer
     * @returns {Promise<void>}
     */
    async depositSent(reference, asset_code, asset_issuer) {
        return this._fetchAndVerify(
            this.host + '/' + asset_issuer + '/Deposit/Sent',
            {
                query: {
                    reference,
                    asset_code
                }
            }
        );
    }

    /**
     * Informs A3S that a deposit has been confirmed at a relay server. A3S will verify this with the relay server before continuing.
     * @param {string} reference
     * @param {string} asset_code
     * @param {string} asset_issuer
     * @returns {Promise<void>}
     */
    async depositConfirmed(reference, asset_code, asset_issuer) {
        return this._fetchAndVerify(
            this.host + '/' + asset_issuer + '/Deposit/Confirmed',
            {
                query: {
                    reference,
                    asset_code
                }
            }
        );
    }

    /**
     * Fetches deposit instructions from A3S.
     * @param {string} asset_code
     * @param {string} asset_issuer
     * @param {string} account
     * @param {Object} [options]
     * @param {string} [options.memo_type] if memo_type is specified, memo is also required
     * @param {string} [options.memo] if memo is specified, memo_type is also required
     * @returns {Promise<void>}
     */
    async depositInstructions(asset_code, asset_issuer, account, options) {
        return this._fetchAndVerify(
            this.host + '/' + asset_issuer + '/Deposit',
            {
                query: {
                    asset_code,
                    account,
                    ...options
                }
            }
        );
    }

    /**
     * Fetches withdrawal instructions from A3S.
     * @param {string} asset_code
     * @param {string} asset_issuer
     * @param {string} dest
     * @param {Object} [options]
     * @param {string} [options.dest_extra] A dest extra if required
     * @returns {Promise<void>}
     */
    async withdrawalInstructions(asset_code, asset_issuer, dest, options) {
        return this._fetchAndVerify(
            this.host + '/' + asset_issuer + '/Deposit',
            {
                query: {
                    asset_code,
                    ...options
                }
            }
        );
    }

    /**
     * Informs A3S that a withdrawal has been sent on the Stellar network.
     * @param tx_hash The transaction has on the Stellar network
     * @param op_order The order of the payment operation within the transaction
     * @returns {Promise<Object>}
     */
    async withdrawalSent(tx_hash, op_order) {
        return this._fetchAndVerify(
            this.host + '/Withdraw/Sent',
            {
                query: { id }
            }
        );
    }

    /**
     * Informs A3S that a withdrawal has been confirmed. This should be sent by the relay server when it is finished executing a withdrawal. A3S will verify this before continuing.
     * @param {string} reference
     * @param {string} asset_code
     * @param {string} asset_issuer
     * @returns {Promise<Object>}
     */
    async withdrawalConfirmed(reference, asset_code, asset_issuer) {
        return this._fetchAndVerify(
            this.host + '/' + asset_issuer + '/Withdraw/Confirmed',
            {
                query: {
                    reference,
                    asset_code
                }
            }
        );
    }

    /**
     * Fetches a withdrawal from A3S
     * @param id The anchor transaction id
     * @returns {Promise<Object>}
     */
    async withdrawal(asset_issuer, id) {
        const payload = await this.transaction({id});

        if (payload.transaction.kind !== 'withdrawal') {
            return null;
        }

        return {
            withdrawal: payload.transaction
        };
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
    async _fetchAndVerify(uri, options = {}) {
        const self = this;

        options.transform = function (body, response, resolveWithFullResponse) {
            if (response.statusCode !== 200 || !body) {
                return body;
            }

            if (!response.headers.signature || !self.verifyPayload(response.headers.signature, body)) {
                return null;
            }
            return body;
        };

        return this._fetch(uri, options);
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
    async _fetch(uri, options = {}) {
        return rpn({
            method: options.method || 'GET',
            uri,
            qs: options.query || {},
            json: true,
            transform: options.transform
        });
    }

    verifyPayload(signature, payload, pubKey) {
        pubKey = pubKey || this.signingPubKey;
        const keypair = StellarSdk.Keypair.fromPublicKey(pubKey);
        return keypair.verify(JSON.stringify(payload), Buffer.from(signature, 'base64'));
    }
}