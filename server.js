const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.use('/public', express.static('public'))

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
    res.render('index.ejs');
});

app.get('/write', (req, res) => {
    res.render('write.ejs');
});

app.get('/list', (req, res) => {
    db.collection('post').find().toArray((error, result) => {
        if (error) console.error(error);
        res.render('list.ejs', {posts: result});
    });
});

app.post('/add', (req,res) => {
    res.send('<h1>전송 완료</h1><a href="/">돌아가기</a>');
    db.collection('counter').findOne({name: '게시물갯수'}, (error, result) => {
        db.collection('post').insertOne({_id: result.totalPost++, title: req.body.title, date: req.body.date}, (error, result) => {
            db.collection('counter').updateOne({name: '게시물갯수'}, {$inc: {totalPost: 1}});
        });
    });
    
});

app.delete('/delete', (req,res) => {
    db.collection('post').deleteOne({_id: parseInt(req.body._id)}, (error, result) => {
        if (error) res.status(400).send("실패");
        else res.status(200).send("성공");
    })
});

app.get('/detail/:id', (req, res) => {
    db.collection('post').findOne({_id: Number(req.params.id)}, (error, result) => {
        res.render('detail.ejs', {posts: result});
    });
});