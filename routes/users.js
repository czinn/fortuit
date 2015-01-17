var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Prediction = require('../models/prediction');
var analyze = require('./analyze');

var PAGE_SIZE = 10;

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

function getPredictions(id, options, cb) {
  User.findById(id, function(err, user) {
    if(err) return cb(err, null);
    var query = Prediction.where({user: id});
    if(options.resolved === true) {
      query.where({resolved: true});
    } else if(options.resolved === false) {
      query.where({resolved: {$ne: true}});
    }
    if(!options.count) {
      query.sort('-created');
    }
    if(options.page !== undefined) {
      query.skip(options.page * PAGE_SIZE).limit(PAGE_SIZE);
    }
    query.populate('affair');
    if(!options.count) {
      query.exec(cb);
    } else {
      query.count(cb);
    }
  });
}

/* GET user's predictions */
router.get('/:id/predictions', function(req, res, next) {
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;

  var options = {};
  if(req.query.page) options.page = parseInt(req.query.page);
  if(req.query.resolved) options.resolved = req.query.resolved === 'true';

  getPredictions(req.params.id, options, function(err, predictions) {
    if(err) return res.send({'error': 'could not find predictions'});
    res.send(predictions);
  });
});

router.get('/:id/predictions/pages', function(req, res, next) {
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;

  var options = {count: true};

  if(req.query.resolved) options.resolved = req.query.resolved === 'true';

  getPredictions(req.params.id, options, function(err, count) {
    if(err) return res.send({'error': 'could not find predictions'});
    res.send({count: Math.ceil(count / PAGE_SIZE)});
  });
});

router.get('/:id/stats', function(req, res, next) {
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;

  getPredictions(req.params.id, {resolved: true}, function(err, predictions) {
    if(err) return res.send({'error': 'could not find predictions to generate data'});
    res.send(analyze(predictions));
  });
});

module.exports = router;
