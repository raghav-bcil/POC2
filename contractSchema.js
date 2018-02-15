var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//schema to contain contract addresses for a user/client
var ContractSchema = new Schema({

  contractAddress: { type: String, required: true, unique: true },
  contractVariableNames: Array,
  contractVariableTypes: Array
});


var Contract = mongoose.model('Contract', ContractSchema);

// make this available to our users in our Node applications
module.exports = Contract;