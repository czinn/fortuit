var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/main',
    failureRedirect: '/',
    failureFlash: true
  })
);

module.exports = router;
