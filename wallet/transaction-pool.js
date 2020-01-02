const Transaction = require('./transaction');

class TransactionPool {
    constructor(){
        this.transactionMap = {};
    }

    setTransaction(transaction){
        this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap){
        this.transactionMap = transactionMap;
    }

    existingTransaction({inputAddress}){
        const transactions = Object.values(this.transactionMap);
        return transactions.find(transaction => transaction.input.address === inputAddress);
    }

    validTransactions(){
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction));
    }

    clear() {
        this.transactionMap = {};
    }

    clearBlockchainTransaction({ chain }) {
        for(let i=1; i<chain.length; i++){
            const block = chain[i];
            for(let trans of block.data){
                if(this.transactionMap[trans.id]){
                    delete this.transactionMap[trans.id];
                }
            }
        }
    }
}

module.exports = TransactionPool;