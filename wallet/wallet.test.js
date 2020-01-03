const Wallet = require('./wallet.js');
const Transaction = require('./transaction');
const { verifySignature } = require('../util/elliptic');
const BlockChain = require('../blockchain/blockchain');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it('has a `balance`', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publicKey`', () => {
        console.log(`publicKey: ${wallet.publicKey}`);
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data) 
            })).toBe(true);
        });

        it('does not verify an invalid signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Wallet().sign(data)
            })).toBe(false);
        });

    });

    describe('createTransaction()', () => {

        describe('and the amount exceeds the balance', () => {
            it('throws an error', () => {
                expect(() => wallet.createTransaction({amount: 999999, recipient: 'foo-recipient'}))
                .toThrow('amount exceeds balance');
            });
        });

        describe('and the amount is valid', () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50;
                recipient = 'foo-recipient';
                transaction = wallet.createTransaction({amount, recipient});
            });

            it('creates an instance of `Transaction`', () => {
                
                expect(transaction instanceof Transaction).toBe(true);
            });

            it('matches the transaction input iwth the wallet', () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it('outputs the amount the recipient', () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });

        expect('and a chain is passed', () => {
            it('calls `Wallet.calculateBalance()`', () => {
                const calculateBalanceMock = jest.fn();
                const originalCalculateBalance = Wallet.calculateBalance;
                Wallet.calculateBalance = calculateBalanceMock;
                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 10,
                    chain: new BlockChain().chain
                });
                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance = originalCalculateBalance;
            });
        });

    });

    describe('calculateBalance()', () => {
        let blockchain;
        beforeEach(() => {
            blockchain = new BlockChain();
        });
        
        describe('and there is no output for the wallet', () => {
            it('returns the `STARTING_BALANCE', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey })
                ).toEqual(STARTING_BALANCE);
            });

        });

        describe('and there is output for the wallet', () => {
            let tOne, tTwo;
            beforeEach(() => {
                tOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 60
                }); 

                tTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 40
                });

                blockchain.addBlock({data: [tOne, tTwo]});
            });

            it('adds the sum of all outputs to the wallet balance', () => {
                expect(Wallet.calculateBalance({
                    chain: blockchain.chain,
                    address: wallet.publicKey
                })).toEqual(STARTING_BALANCE + 
                    tOne.outputMap[wallet.publicKey] + tTwo.outputMap[wallet.publicKey]);
            });

            describe('and the wallet has made a transaction', () => {
                let recentTrans;
                beforeEach(() => {
                    recentTrans = wallet.createTransaction({
                        recipient: 'foo',
                        amount: 30
                    });
                    blockchain.addBlock({data: [recentTrans]});
                });

                it('returns the output amount of the recent trans.', () => {
                    expect(Wallet.calculateBalance({
                        chain: blockchain.chain,
                        address: wallet.publicKey
                    })).toEqual(recentTrans.outputMap[wallet.publicKey]);
                });

                describe('and there are outputs next to and after the recent trans.', () => {
                    let sameBlockTrans, nextBlockTrans;
                    beforeEach(() => {
                        recentTrans = wallet.createTransaction({
                            recipient: 'later-foo',
                            amount: 60
                        });
                        sameBlockTrans = Transaction.rewardTransaction({minerWallet: wallet});
                        blockchain.addBlock({data: [recentTrans, sameBlockTrans]});
                        nextBlockTrans = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 70
                        });
                        blockchain.addBlock({data: [nextBlockTrans]});
                    });

                    it('includes the output amount of the returned balance ', () => {
                        expect(Wallet.calculateBalance({
                            chain: blockchain.chain,
                            address: wallet.publicKey
                        })).toEqual(
                            recentTrans.outputMap[wallet.publicKey] + 
                            sameBlockTrans.outputMap[wallet.publicKey] +
                            nextBlockTrans.outputMap[wallet.publicKey]
                        );
                    });
                });
            });

        });
    });

});