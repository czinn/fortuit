var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Prediction = require('../models/prediction');

/* GET users listing */
router.get('/', function(req, res, next) {
  User.find(function(err, users) {
    res.send(users);
  });
});

/* GET specific user */
router.get('/:id', function(req, res, next) {
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;

  User.findById(req.params.id, function(err, user) {
    if(err) return res.send({'error': 'user not found'});
    res.send(user);
  });
});

/* GET user's predictions */
router.get('/:id/predictions', function(req, res, next) {
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;
  
  User.findById(req.params.id, function(err, user) {
    if(err) return res.send({'error': 'user not found'});
    Prediction.find({user: user._id})
      .populate('affair')
      .exec(function(err, predictions) {
      if(err) return res.send({'error': 'could not find predictions'});
      res.send(predictions);
    });
  });
});

module.exports = router;
