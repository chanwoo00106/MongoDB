const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
let multer = require('multer');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/image')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

let upload = multer({storage: storage})

require('dotenv').config();

// app.use는 요청과 응답 사이에 실행할 것을 적음
app.use(session({secret: '비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static('public'));
app.use('/shop', require('./routes/shop.js'));
app.set('view engine', 'ejs');

MongoClient.connect(
    `mongodb+srv://chanwoo:${process.env.PASSWORD}@cluster0.jvys6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    (error, client) => {
        if (error) return console.log(error);
        db = client.db('todoapp');

        app.listen(process.env.PORT, () => {
            console.log(`${process.env.PORT} port`);
        });
    }
);

app.get('/', (req, res) => {
    db.collection('post').find().limit(20).sort({"_id": -1}).toArray((error, result) => {
        res.render('index.ejs', {posts: result});
    });
});

app.get('/write', (req, res) => {
    res.render('write.ejs');
});

app.get('/list', (req, res) => {
    if (req.query.search) {
        var condition = [
            {
                $search: {
                    index: 'titleSearch',
                    text: {
                        query: req.query.search,
                        path: 'title'  // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
                    }
                }
            },
            {$sort: {_id: 1}},
            {$limit: 10}
        ] 
        db.collection('post').aggregate(condition).toArray((error, result) => {
            if (error) console.log(error)
            else res.render('list.ejs', {posts: result});
        });
    }
    else {
        db.collection('post').find().limit(20).sort({"_id": -1}).toArray((error, result) => {
            if (error) console.error(error);
            res.render('list.ejs', {posts: result});
        });
    }
});

app.post('/add', (req,res) => {
    res.send('<h1>전송 완료</h1><a href="/">돌아가기</a>');
    const add = async () => {
        const num = await db.collection('counter').findOne({name: '게시물갯수'});
        const post = await db.collection('post').findOne({_id: num.totalPost});
        if (num.totalPost >= 20) {
            num.totalPost = 0;
            await db.collection('post').update({_id: num.totalPost}, {$set: {title: req.body.title, text: req.body.text, date: req.body.date}}).then(output => {
                console.log("update 완료");
            }).catch(err => {
                console.log(err);
            });
            await db.collection('counter').update({name: '게시물갯수'}, {$set: {totalPost: num.totalPost}});
        }
        else if (!post){
            await db.collection('post').insertOne({_id: num.totalPost++, title: req.body.title, text: req.body.text, date: req.body.date})
            await db.collection('counter').update({name: '게시물갯수'}, {$set: {totalPost: num.totalPost}});
        }
        else {
            await db.collection('post').update({_id: num.totalPost++}, {$set: {title: req.body.title, text: req.body.text, date: req.body.date}})
            await db.collection('counter').update({name: '게시물갯수'}, {$set: {totalPost: num.totalPost}});
        }
    }
    add();
});


app.get('/detail/:id', (req, res) => {
    db.collection('post').findOne({_id: Number(req.params.id)}, (error, result) => {
        res.render('detail.ejs', {posts: result});
    });
});
