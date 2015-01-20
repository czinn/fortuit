var mongoose = require('mongoose');

// Mongoose connection
mongoose.connect('mongodb://localhost/fortuit');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
  console.log("Mongoose init'd.");
});

// Models
var User = require('./user');
var Affair = require('./affair');
var Prediction = require('./prediction');
