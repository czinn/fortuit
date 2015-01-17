var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./user');

var AffairSchema = mongoose.Schema({
  // The user-entered description of the affair.
  desc: { type: String, default: "" }, // empty string means to display date
  created: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: 'User' }
});

var Affair;
try {
  Affair = mongoose.model('Affair', AffairSchema);
}
catch(e) {
  Affair = mongoose.model('Affair');
}

module.exports = Affair;
