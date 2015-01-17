var express = require('express');
var router = express.Router();
var Prediction = require('../models/prediction');
var Affair = require('../models/affair');

/* GET all predictions */
router.get('/', function(req, res, next) {
  Prediction.find()
    .populate('affair')
    .sort('-created')
    .exec(function(err, predictions) {
    res.send(predictions);
  });
});

/* POST new prediction */
router.post('/', function(req, res, next) {
  // Ensure logged in
  if(!req.user) {
    return res.send({'error': 'must be logged in'});
  }
  // Ensure all required fields are filled out
  if(!req.body.confidence || parseInt(req.body.confidence) <= 0 || parseInt(req.body.confidence) >= 100) {
    return res.send({'error': 'invalid confidence'});
  }

  if(!req.body.desc) {
    req.body.desc = "";
  }
  var affair = new Affair({user: req.user._id, desc: req.body.desc});
  affair.save(function() {
    var prediction = new Prediction({user: req.user._id, affair: affair._id, confidence: parseInt(req.body.confidence)});
    prediction.save(function () {
      prediction.populate('affair', function(err, prediction) {
        res.send(prediction);
      });
    });
  });
});

/* DELETE prediction */
router.delete('/:id', function(req, res, next) {
  if(!req.user) {
    return res.send({'error': 'must be logged in'});
  }
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;

  Prediction.findByIdAndRemove(req.params.id, function(err, predictions) {
  });
  res.send({});
});

module.exports = router;
