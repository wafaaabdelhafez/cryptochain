const cryptoHash = require('../util/crypto-hash');
const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain ;

   beforeEach( () => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
    });

    it('contains a chain array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('add a new block to the chain', () => {
        const newData = 'new';
        blockchain.addBlock({data: newData});
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
    });

    describe('isValidChain', () => {

        describe('when the chain does not start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); 
            });
        });

        describe('when the chain starts with the genesis block and has multible blocks', () => {
            
            beforeEach( () => {
                blockchain.addBlock({data: 'Bears'});
                blockchain.addBlock({data: 'Beats'});
                blockchain.addBlock({data: 'Beafs'});
            });

            describe('and a lastHash refrence has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lasHash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); 
                });
            });
            
            describe('and the chain contains a block with an invalide field', () => {
                it('returns flase', () => {
                    blockchain.chain[2].data = 'some-bad-and-evil-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); 
                });
            });

            describe('and the chian contains a block with a jumped difficulty', ()=> {
                it('return false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data= [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    const badBlock = new Block({
                        timestamp, lastHash, hash, nonce, difficulty, data
                    });

                    blockchain.chain.push(badBlock);
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true); 
                });
            });

        });

    });

    describe('replaceChain()', () => {
        let errorMock, logMock;
        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();
            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = {new : 'chain'};
                blockchain.replaceChain(newChain.chain);
            });
            it('does not replace the chain', () => {
                expect(blockchain.chain).toEqual(originalChain);
            });
            it('logs an error', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });


        describe('when the chain is longer', () => {

            beforeEach( () => {
                newChain.addBlock({data: 'Bears'});
                newChain.addBlock({data: 'Beats'});
                newChain.addBlock({data: 'Beafs'});
            });

            describe('and the chian is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });
                it('does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });
                it('logs an error', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });
                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });

        });

    });

});
