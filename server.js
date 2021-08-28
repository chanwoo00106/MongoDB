const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

app.use(session({secret: '비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static('public'));
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

app.get('/', loginTF, (req, res) => {
    db.collection('post').find().toArray((error, result) => {
        if (error) console.log(error);
        else {
            console.log(req.user);
            res.render('mypage.ejs', {posts: result});
        }
    });
});
function loginTF(req, res, next){
    if (req.user){
        next();
    } else {
        res.render('index.ejs');
    }
}

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

app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({_id: Number(req.params.id)}, (error, result) => {
        res.render('edit.ejs', {posts: result});
    });
});

app.put('/edit', (req, res) => {
    db.collection('post').updateOne({_id: parseInt(req.body.id)}, {$set: {title: req.body.title, date: req.body.date}}, (error, result) => {
        if(error) console.error(error);
        else console.log('완료');
        res.redirect('/');
    });
});




app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), (req, res) => {
    res.redirect('/');
});


passport.use(new LocalStrategy({
    // setting 하는 부분
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (inputId, inputPw, done) {
    //console.log(inputId, inputPw);
    db.collection('login').findOne({ id: inputId }, function (error, result) {
      if (error) return done(error) // 아이디가 없을 때
  
      if (!result) return done(null, false, { message: '아이디가 존재하지 않습니다.' }) // 아이디가 없을 때

      if (inputPw == result.pw) {
        return done(null, result) // 아이디도 있고 비번도 맞을 때
      } else {
        return done(null, false, { message: '비밀번호가 틀립니다.' }) // 비번이 아닐 때
      }
    })
}));

// session 만들기
passport.serializeUser((user, done) => { // 바로 위에서 했던 결과가 여기로 옴
    done(null, user.id);
});

passport.deserializeUser((id, done) => { // 세션을 찾을 때 실행됨
    db.collection('login').findOne({id: id}, (error, result) => {
        done(null, result);
    });
})