var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = mongoose.Schema({
  name: String,
  password: String,
});

UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.pre('save', function(next) {
  var user = this;

  if(!user.isModified('password')) return next();

  bcrypt.hash(user.password, null, null, function(err, hash) {
    if(err) return next(err);

    user.password = hash;
    next();
  });
});

var User;
try {
  User = mongoose.model('User', UserSchema);
}
catch(e) {
  User = mongoose.model('User');
}

module.exports = User;
