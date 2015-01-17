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
  if(!req.query.affair) {
    var affair = new Affair({user: req.user._id, desc: req.body.desc});
    affair.save(function() {
      var prediction = new Prediction({user: req.user._id, affair: affair._id, confidence: parseInt(req.body.confidence)});
      prediction.save(function () {
        prediction.populate('affair', function(err, prediction) {
          prediction = JSON.parse(JSON.stringify(prediction));
          prediction.affair.user = {_id: prediction.affair.user};
          res.send(prediction);
        });
      });
    });
  } else {
    Affair.findById(req.query.affair, function(err, affair) {
      if(err) return res.send({'error': 'invalid affair'});
      var prediction = new Prediction({user: req.user._id, affair: affair._id, confidence: parseInt(req.body.confidence)});
      prediction.save(function () {
        prediction.populate('affair', function(err, prediction) {
          res.send(prediction);
        });
      });
    });
  }
});

/* DELETE prediction */
router.delete('/:id', function(req, res, next) {
  if(!req.user) {
    return res.send({'error': 'must be logged in'});
  }
  if(req.params.id === 'me' && req.user)
    req.params.id = req.user._id;

  Prediction.findById(req.params.id).populate('affair').exec(function(err, prediction) {
    if(prediction.user + "" !== "" + prediction.affair.user) {
      prediction.remove();
      res.send({});
    } else {
      // Must remove affair and all its children too
      Affair.findByIdAndRemove(prediction.affair._id, function(err, data) {
        Prediction.remove({affair: prediction.affair._id}, function(err, data) {
          res.send({});
        });
      });
    }
  });
});

module.exports = router;
