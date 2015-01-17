var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
  _id: String,
  name: String,
  password: String
})

var User = mongoose.model('User', UserSchema);

module.exports = User;
