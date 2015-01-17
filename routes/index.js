var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST login handler */
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/main',
    failureRedirect: '/',
    failureFlash: false
  })
);

/* GET logout handler */
router.get('/logout', function(req, res, next) {
  if(req.user) {
    req.logout();
  }
  res.redirect('/');
});

/* GET main app page */
router.get('/main', function(req, res, next) {
  if(!req.user) {
    res.redirect('/');
  } else {
    res.render('main', {user: req.user});
  }
});

module.exports = router;
