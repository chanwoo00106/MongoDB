const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.listen(8000, () => {
    console.log('8080 port');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html');
})

app.post('/add', (req,res) => {
    res.send('<h1>전송 완료</h1>');
    console.log(req.body.title)
})