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
      query.exec(function(err, predictions) {
        if(err) return cb(err, predictions);
        var started = 0;
        for(var i = 0; i < predictions.length; i++) {
          predictions[i] = JSON.parse(JSON.stringify(predictions[i]));
          if(predictions[i].affair.user + "" === "" + id) {
            predictions[i].affair.user = {name: user.name, _id: user._id};
          } else {
            started += 1;
            (function(j) {
              User.findById(predictions[j].affair.user, function(err, user) {
                if(user !== null) {
                  predictions[j].affair.user = {name: user.name, _id: user._id};
                }
                started -= 1;
                if(started === 0 && i >= predictions.length) {
                  cb(null, predictions);
                  started = -1;
                }
              });
            })(i);
          }
        }
        if(started === 0) {
          cb(null, predictions);
        }
      });
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

/* GET user's friends */
router.get('/:id/friends', function(req, res, next) {
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;

  User.findById(req.params.id).populate('friends').exec(function (err, user) {
    if(err) return res.send({'error': 'could not find friends'});
    res.send(user);
  });
});

/* POST add a friend to an existing user */
router.post('/:id/add-friend', function(req, res, next) {
  // Ensure logged in
  if(!req.user) {
    return res.send({'error': 'must be logged in'});
  }
  if(req.params.id != 'me') {
    return res.send({'error': 'can only add friends to yourself'});
  }

  // Ensure friend is specified
  if(!req.body.newFriendName) {
    return res.send({'error': 'invalid friend'});
  }

  User.findOne({name: req.body.newFriendName}, function(err, newFriend) {
    if(err || !newFriend) return res.send({'error': 'could not find user'});
    if(newFriend._id == req.user._id) return res.send({'error': 'cannot friend yourself'});
    if(req.user.friends.indexOf(newFriend._id) != -1) return res.send({'error': 'already on friend list'});
    User.findOneAndUpdate(
      {_id: req.user._id},
      {$push: {friends: newFriend._id}},
      {safe: true, upsert: true},
      function (err, model) {
        console.log(err);
        res.send(newFriend);
      }
    );
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
