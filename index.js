const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const BlockChain = require('./blockchain/blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet/wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
const blockchain = new BlockChain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub});

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockchain.addBlock({ data });
    pubsub.broadcastChain();
    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const {amount, recipient} = req.body;
    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});
    try {
        if(transaction){
            transaction.update({senderWallet: wallet, recipient, amount});
        } else {
            transaction = wallet.createTransaction({amount , recipient, chain: blockchain.chain});
        }
    } catch (error) {
        return res.status(400).json({type: 'error', message: error.message});
    }
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    res.json({transaction});
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransaction();

    res.redirect('/api/blocks');
});


const syncWithRootState = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if(!error && response.statusCode === 200){
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response, body) => {
        if(!error && response.statusCode === 200){
            const rootTransactionPoolMap = JSON.parse(body);
            console.log('replace transaction pool map on async with ', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

let PERR_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PERR_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PERR_PORT || DEFAULT_PORT;
app.listen(PORT, () => { 
    console.log(`listining at localhost: ${PORT}`);
    if(PORT !== DEFAULT_PORT){
        syncWithRootState();
    }
});