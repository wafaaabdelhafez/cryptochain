const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const lastBlock = this.chain[this.chain.length - 1];
        const block = Block.mineBlock({lastBlock: lastBlock, data: data});
        this.chain.push(block);
    }

    replaceChain(chain, onSuccess) {
        if(chain.length <= this.chain.length){
            console.error('the incoming chain must be longer.');
            return;
        }
        if(!Blockchain.isValidChain(chain)){
            console.error('the incoming chain must be valid.');
            return;
        }
        if(onSuccess) onSuccess()
        console.log('replacing the chain', chain);
        this.chain = chain
    }

    static isValidChain(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false
        };

        for (let i=1; i< chain.length; i++) {
            const {timestamp , lastHash, hash, nonce, difficulty, data} = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            if(lastHash !== actualLastHash) return false;

            const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
            if(hash !== validatedHash) return false;

            if(Math.abs(lastDifficulty - difficulty) > 1 ) return false;
        }

        return true;
    }
}

module.exports = Blockchain; 