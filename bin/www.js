#! /usr/bin/env node
const createServer = require('../index');
const port = 4000;

createServer().listen(port, () => {
    console.log(`app is start port ${port}: localhost:${port}`);
});
