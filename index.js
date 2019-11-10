const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const BlockChain = require('./blockchain/blockchain');
const PubSub = require('./app/pubsub');

const app = express();
const blockchain = new BlockChain();
const pubsub = new PubSub({ blockchain });

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

const syncChains = () => {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        if(!error && response.statusCode === 200){
            const rootChain = JSON.parse(body);
            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
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
        syncChains();
    }
});