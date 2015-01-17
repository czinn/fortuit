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

/* GET main app page */
router.get('/main', function(req, res, next) {
  res.render('main', {user: req.user});
});

module.exports = router;
