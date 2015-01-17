var express = require('express');
var router = express.Router();
var Prediction = require('../models/prediction');
var Affair = require('../models/affair');

/* POST resolve affair */
router.post('/:id', function(req, res, next) {
  if(!req.user) {
    return res.send({'error': 'must be logged in'});
  }

  if(req.body.result === undefined || typeof req.body.result !== 'boolean') {
    return res.send({'error': 'invalid result'});
  }

  Affair.findById(req.params.id, function(err, affair) {
    if(err || affair === null) return res.send({'error': 'could not find affair'});

    if(affair.user + "" !== "" + req.user._id) {
      return res.send({'error': 'must be affair owner'});
    }

    if(affair.resolved) {
      return res.send({'error': 'affair already resolved'});
    }

    affair.resolved = true;
    affair.result = req.body.result;
    affair.save();

    Prediction.find({affair: affair._id}, function(err, predictions) {
      predictions.forEach(function(prediction) {
        prediction.resolved = true;
        prediction.save();
        // todo: apply points
      });

      res.send(affair);
    });
  });
});

module.exports = router;
