const express = require('express');
const app = express();

app.listen(8000, () => {
    console.log('8080 port');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});