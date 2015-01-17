var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

var PredictionSchema = mongoose.Schema({
  // User's confidence (0.0-1.0) in the affair.
  confidence: { type: Number },
  affair: { type: Schema.ObjectId, ref: 'Affair' },
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' },
  resolved: { type: Boolean, default: false}
});

var Prediction;
try {
  Prediction = mongoose.model('Prediction', PredictionSchema);
}
catch(e) {
  Prediction = mongoose.model('Prediction');
}

module.exports = Prediction;
