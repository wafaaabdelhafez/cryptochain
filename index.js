const bodyParser = require('body-parser');
const express = require('express');
const BlockChain = require('./blockchain');
const PubSub = require('./pubsub');

const app = express();
const blockchain = new BlockChain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => pubsub.broadcastChain(), 2000);

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
    res.redirect('/api/blocks');
});

const DEFAULT_PORT = 3000;
let PERR_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PERR_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PERR_PORT || DEFAULT_PORT;
app.listen(PORT, () => { console.log(`listining at localhost: ${PORT}`) });