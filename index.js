const express = require('express');
const BlockChain = require('./blockchain');

const app = express();
const blockChain = new BlockChain();

app.get('/api/blocks', (req, res) => {
    res.json(blockChain.chain);
});

const PORT = 3000;
app.listen(PORT, () => { console.log(`listining at localhost: ${PORT}`) });