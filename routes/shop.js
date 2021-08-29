const router = require('express').Router();

router.get('/shirts', function(req, res){
   res.send('<div>셔츠 파는 페이지입니다.</div><a href="/">홈으로</a>');
});

router.get('/pants', function(req, res){
   res.send('<div>바지 파는 페이지입니다.</div><a href="/">홈으로</a>');
}); 

module.exports = router;