const bodyParser = require('body-parser');
const express = require('express');
const BlockChain = require('./blockchain');

const app = express();
const blockChain = new BlockChain();

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockChain.chain);
});

app.post('/api/mine', (req, res) => {
    const { data } = req.body;
    blockChain.addBlock({ data });
    res.redirect('/api/blocks');
});

const PORT = 3000;
app.listen(PORT, () => { console.log(`listining at localhost: ${PORT}`) });