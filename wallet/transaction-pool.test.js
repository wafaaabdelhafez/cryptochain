const TransactionPool = require('./transaction-pool.js');
const Transaction = require('./transaction');
const Wallet = require('./wallet');

describe('TransactionPool', () => {

    let transactionPool, transaction, senderWallet;
    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet();
        transaction = new Transaction({
            senderWallet,
            recipient: 'fake-recipient',
            amount: 50
        });
    });

    describe('setTransaction()', () => {

        it('add a transaction', () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
        });
    });

    describe('exstingTransaction()', () => {
        it('returns an existing transaction gining an input address', () => {
            transactionPool.setTransaction(transaction);
            expect(transactionPool.existingTransaction({inputAddress: senderWallet.publicKey}))
            .toBe(transaction);
        });
    });

    describe('valideTransaction', () => {
        let validTransactions, errorMock;
        errorMock = jest.fn();
        global.console.error = errorMock;

        beforeEach(() => {
            validTransactions = [];

            for(let i=0; i< 10; i++) {
                transaction = new Transaction({
                    senderWallet,
                    recipient: 'any-recipient',
                    amount: 30
                });

                if(i%3 === 0){
                    transaction.input.amount = 999999
                } else if(i%3 ===1){
                    transaction.input.signature = new Wallet().sign('foo');
                } else {
                    validTransactions.push(transaction);
                }
                transactionPool.setTransaction(transaction);
            }
        });

        it('returns valide transaction', () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        });

        it('logs errors for invalid transactions', () => {
            transactionPool.validTransactions();
            expect(errorMock).toHaveBeenCalled();
        });
    });

});