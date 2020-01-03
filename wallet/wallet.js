const Transaction = require('./transaction');
const {STARTING_BALANCE} = require('../config');
const { ec } = require('../util/elliptic');
const cryptoHash = require('../util/crypto-hash');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({amount, recipient}) {
        if(amount > this.balance){
            throw new Error('amount exceeds balance');
        }
        
        return new Transaction({senderWallet: this, recipient, amount});
    }

    static calculateBalance({chain, address}) {
        let outputTotal = 0;

        for(let i=1; i<chain.length; i++) {
            let block = chain[i];
            for(let trans of block.data) {
                const addressOutput = trans.outputMap[address];
                if(addressOutput) {
                    outputTotal = outputTotal + addressOutput;
                }
            }
        }

        return STARTING_BALANCE + outputTotal;
    }
}

module.exports = Wallet;