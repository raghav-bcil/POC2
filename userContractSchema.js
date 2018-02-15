// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//schema to contain contract addresses for a user/client
var userContractSchema = new Schema({

  username: { type: String, required: true, unique: true },
  contractAddress: String,
  contractABI : String
});


var UserContract = mongoose.model('UserContract', userContractSchema);

// make this available to our users in our Node applications
module.exports = UserContract;