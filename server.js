const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));

const MongoClient = require('mongodb').MongoClient;

app.set('view engine', 'ejs');

MongoClient.connect(
    'mongodb+srv://chanwoo:<password>@cluster0.jvys6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    (error, client) => {
        if (error) return console.log(error);
        db = client.db('todoapp');

        app.listen(8000, () => {
            console.log('8080 port');
            
        });
    }
);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html');
});

app.get('/list', (req, res) => {
    db.collection('post').find().toArray((error, result) => {
        if (error) console.error(error);
        console.log(result);
        res.render('list.ejs', {posts: result});
    });
});

app.post('/add', (req,res) => {
    res.send('<h1>전송 완료</h1>');
    db.collection('post').insertOne({title: req.body.title, date: req.body.date}, (error, result) => {
        console.log('완료')
    });
})