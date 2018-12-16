'use strict';exports.__esModule = true;exports.A3S = undefined;var _a3sConfig = require('./a3sConfig');
var _ConnectionManager = require('./ConnectionManager');let

A3S = exports.A3S = class A3S {
    /**
                                * @param environment sandbox or production
                                */
    constructor(requestSigningSecretKey, environment) {
        this.config = environment === 'sandbox' ? _a3sConfig.a3sConfig.sandbox : _a3sConfig.a3sConfig.production;
        this.connectionManager = new _ConnectionManager.ConnectionManager(this, requestSigningSecretKey);
    }

    useProd() {
        this.config = _a3sConfig.a3sConfig.production;
    }

    useSandbox() {
        this.config = _a3sConfig.a3sConfig.sandbox;
    }

    /**
       * Fetches info from A3S regarding what assets are available
       * @returns {Promise<Object>}
       */
    async info(asset_issuer) {
        return this.connectionManager.fetchAndVerify(this.config.host + '/' + asset_issuer + '/Info');
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
    async transactions(asset_code, asset_issuer, account, options = {}) {
        return this.connectionManager.fetchAndVerify(
        this.config.host + '/' + asset_issuer + '/Transactions',
        {
            query: {
                asset_code,
                account,
                ...options } });



    }

    /**
       * Fetches a specific transaction. One of id, stellar_transaction_id or external_transaction_id must be specified.
       * @param asset_issuer
       * @param [options]
       * @param {number} [options.id]
       * @param {string} [options.stellar_transaction_id]
       * @param {string} [options.external_transaction_id]
       * @returns {Promise<Object>}
       */
    async transaction(asset_issuer, options = {}) {
        if (!options.id && !options.stellar_transaction_id && !options.external_transaction_id) {
            throw new Error('id or stellar_transaction_id or external_transaction_id is required by transaction()');
        }

        const payload = await this.connectionManager.fetchAndVerify(
        this.config.host + '/' + asset_issuer + '/Transaction',
        {
            query: {
                ...options } });




        if (payload) {
            let identifier;
            let corresponding;

            if (options.id) {
                identifier = options.id;
                corresponding = payload.transaction.id;
            } else
            if (options.stellar_transaction_id) {
                identifier = options.stellar_transaction_id;
                corresponding = payload.transaction.stellar_transaction_id;
            } else
            if (options.external_transaction_id) {
                identifier = options.external_transaction_id;
                corresponding = payload.transaction.external_transaction_id;
            }

            if (identifier !== corresponding) {
                return null;
            }
        }

        return payload;
    }

    /**
       * Fetches a deposit from A3S
       * @param asset_issuer
       * @param id The anchor transaction id
       * @returns {Promise<Object>}
       */
    async deposit(asset_issuer, id) {
        const payload = await this.transaction(asset_issuer, { id });

        if (payload && payload.transaction.kind !== 'deposit') {
            return null;
        }

        return {
            deposit: payload.transaction };

    }

    /**
       * Informs A3S that a deposit has been sent by a customer to the relay server. The deposit may or may not be confirmed. A3S will verify this with the relay server before continuing.
       * @param {string} reference
       * @param {string} asset_code
       * @param {string} asset_issuer
       * @returns {Promise<void>}
       */
    async depositSent(reference, asset_code, asset_issuer) {
        return this.connectionManager.fetchAndVerify(
        this.config.host + '/' + asset_issuer + '/Deposit/Sent',
        {
            query: {
                reference,
                asset_code } });



    }

    /**
       * Informs A3S that a deposit has been confirmed at a relay server. A3S will verify this with the relay server before continuing.
       * @param {string} reference
       * @param {string} asset_code
       * @param {string} asset_issuer
       * @returns {Promise<void>}
       */
    async depositConfirmed(reference, asset_code, asset_issuer) {
        return this.connectionManager.fetchAndVerify(
        this.config.host + '/' + asset_issuer + '/Deposit/Confirmed',
        {
            query: {
                reference,
                asset_code } });



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
    async depositInstructions(asset_code, asset_issuer, account, options = {}) {
        return this.connectionManager.fetchAndVerify(
        this.config.host + '/' + asset_issuer + '/Deposit',
        {
            query: {
                asset_code,
                account,
                ...options } });



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
    async withdrawalInstructions(asset_code, asset_issuer, dest, options = {}) {
        return this.connectionManager.fetchAndVerify(
        this.config.host + '/' + asset_issuer + '/Withdraw',
        {
            query: {
                asset_code,
                dest,
                ...options } });



    }

    /**
       * Informs A3S that a withdrawal has been sent on the Stellar network.
       * @param tx_hash The transaction has on the Stellar network
       * @param op_order The order of the payment operation within the transaction
       * @returns {Promise<Object>}
       */
    async withdrawalSent(tx_hash, op_order) {
        return this.connectionManager.fetchAndVerify(
        this.config.host + '/Withdraw/Sent',
        {
            query: { id } });


    }

    /**
       * Informs A3S that a withdrawal has been confirmed. This should be sent by the relay server when it is finished executing a withdrawal. A3S will verify this before continuing.
       * @param {string} reference
       * @param {string} asset_code
       * @param {string} asset_issuer
       * @returns {Promise<Object>}
       */
    async withdrawalConfirmed(reference, asset_code, asset_issuer) {
        return this.connectionManager.fetchAndVerify(
        this.config.host + '/' + asset_issuer + '/Withdraw/Confirmed',
        {
            query: {
                reference,
                asset_code } });



    }

    /**
       * Fetches a withdrawal from A3S
       * @param {string} asset_issuer
       * @param id The anchor transaction id
       * @returns {Promise<Object>}
       */
    async withdrawal(asset_issuer, id) {
        const payload = await this.transaction(asset_issuer, { id });

        if (payload && payload.transaction.kind !== 'withdrawal') {
            return null;
        }

        return {
            withdrawal: payload.transaction };

    }};