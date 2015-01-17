var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET create page */
router.get('/create', function(req, res, next) {
  res.render('create', {error: false});
});

/* POST login handler */
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/main',
    failureRedirect: '/',
    failureFlash: false
  })
);

/* POST create handler */
router.post('/create', function(req, res, next) {
  if(!req.body.username || !req.body.password || !req.body.confirm) {
    return res.render('create', {error: 'All fields are required.'});
  }
  if(req.body.password !== req.body.confirm) {
    return res.render('create', {error: 'Passwords do not match.'});
  }
  User.findOne({name_lower: req.body.username.toLowerCase()}, function(err, user) {
    if(user !== null) {
      return res.render('create', {error: 'Username already in use.'});
    }
    
    var u = new User({name: req.body.username, password: req.body.password});
    u.save();
    res.redirect('/');
  })
});

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
