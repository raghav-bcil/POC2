var express = require("express");  
var bodyParser = require('body-parser')
var app = express();  
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var fs = require('fs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/myappdatabase');
const solc = require('solc');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

server.listen(8080, function() {
    console.log('ready to go!');
});

app.use(express.static("public"));

app.get("/", function(req, res){

	res.sendFile(__dirname + "/public/html/index.html");

})

app.get("/index.html", function(req, res){

	res.sendFile(__dirname + "/public/html/index.html");

})

app.get("/template1.html", function(req, res){

	res.sendFile(__dirname + "/public/html/template1.html");

})



app.get("/template2.html", function(req, res){

	res.sendFile(__dirname + "/public/html/template2.html");

})

var Web3 = require("web3");

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));	

console.log(web3.isConnected());

//to be read from Database Layer

var contractObject = web3.eth.contract([ { "constant": true, "inputs": [ { "name": "recordId", "type": "bytes32" } ], "name": "getRecordData", "outputs": [ { "name": "", "type": "bytes32[]" } ], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [ { "name": "recordData", "type": "bytes32[5]" } ], "name": "createRecord", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "recordId", "type": "bytes32" }, { "indexed": false, "name": "entry1", "type": "bytes32" }, { "indexed": false, "name": "entry2", "type": "bytes32" }, { "indexed": false, "name": "entry3", "type": "bytes32" }, { "indexed": false, "name": "entry4", "type": "bytes32" }, { "indexed": false, "name": "status", "type": "bool" } ], "name": "recordAddedStatus", "type": "event" } ]);

var contractInstance = contractObject.at("0xdd6c0fcacdf61a1bb49da759e8586f43b182b3a8");


app.post("/createSmartContract",function(req,res){

	console.log(req.body.inputFields);
	var inputFields= JSON.parse(req.body.inputFields);
	console.log(inputFields);
	//inputFields contain two arrays for field name and its data type
	var contractString = "pragma solidity ^0.4.12; contract SampleContract {";

	var structureString = "struct Record{ string recordId;";
	var inputFieldsNames = inputFields.inputFieldsNames;
	var inputFieldsTypes = inputFields.inputFieldsTypes;
	var length = inputFieldsNames.length;
	for(var i=0;i<inputFieldsTypes.length;++i){
		var stringToAdd = "" + inputFieldsTypes[i] + " " + inputFieldsNames[i] + ";";
		structureString+= stringToAdd; 
	}
	structureString += "}"
	contractString += structureString;
	contractString += " mapping (string => Record) RecordsList; "
	var createRecordFunctionString  = "function createRecord( string recordId,";

	for(var i=0;i<inputFieldsTypes.length;++i){
		var stringToAdd = "" + inputFieldsTypes[i] + " " + inputFieldsNames[i] + ",";
		createRecordFunctionString+= stringToAdd; 
	}

	createRecordFunctionString = createRecordFunctionString.slice(0, -1); //to remove exctra comma
	createRecordFunctionString += "){ RecordsList[recordId] = Record( recordId, ";

	for(var i=0;i<inputFieldsTypes.length;++i){
		var stringToAdd = " " + inputFieldsNames[i] + ",";
		createRecordFunctionString+= stringToAdd; 
	}
	createRecordFunctionString = createRecordFunctionString.slice(0, -1);
	createRecordFunctionString += ");}";
	contractString += createRecordFunctionString;

	var getRecordFunctionString = "function getRecord(string recordId) constant returns("

	for(var i=0;i<inputFieldsTypes.length;++i){
		var stringToAdd = " " + inputFieldsTypes[i] + ",";
		getRecordFunctionString+= stringToAdd; 
	}
	getRecordFunctionString = getRecordFunctionString.slice(0, -1);
	getRecordFunctionString+= "){ return (";
	for(var i=0;i<inputFieldsTypes.length;++i){
		var stringToAdd = " " + "RecordsList[recordId]." + inputFieldsNames[i] + ",";
		getRecordFunctionString+= stringToAdd; 
	}	
	getRecordFunctionString = getRecordFunctionString.slice(0, -1);

	getRecordFunctionString += ");";

	contractString += getRecordFunctionString + "}}";
	
	console.log(contractString);

	fs.writeFile("SampleContract.sol", contractString, function(err) {
    if(err) {
        return console.log(err);
    }


   	const input = fs.readFileSync('SampleContract.sol');
	const output = solc.compile(input.toString(), 1);	

	var bytecode = output.contracts[':SampleContract'].bytecode;
	var abiTemp = output.contracts[':SampleContract'].interface;
	var abi = JSON.parse(output.contracts[':SampleContract'].interface);
	
	const contract = web3.eth.contract(abi);

	// Deploy contract instance
	const contractInstance = contract.new({
	data: '0x' + bytecode,
	from: web3.eth.coinbase,
	gas: 4700000
	}, (err, res) => {
	if (err) {
	    console.log(err);
	    return;
	}

	// Log the tx, you can explore status with eth.getTransaction()
	console.log(res.transactionHash);

	// If we have an address property, the contract was deployed
	if (res.address) {
	    console.log('Contract address: ' + res.address);
	    var contractAddress = res.address;
	    var UserContract = require('./userContractSchema.js');
	    var data = new UserContract({
		  username: 'Chris',
		  contractAddress :  contractAddress,
		  contractABI : abiTemp
		});
		data.save(function(err) {
		  if (err) throw err;
		  console.log('Contract Details saved successfully!');

		});

	    var Contract = require('./contractSchema.js');
	    var data2 = new Contract({
		  contractAddress: contractAddress,
		  contractVariableNames :  inputFieldsNames,
		  contractVariableTypes :  inputFieldsTypes
		});
		data2.save(function(err) {
		  if (err) throw err;
		  console.log('Contract Variables Details saved successfully!');
		  
		});

	}
	});


	});
	res.send("Template successfully created.")
})

app.post("/addRecord", function(req, res){


	console.log(req.body.formData);
	var formDataObject= JSON.parse(req.body.formData);
	console.log(formDataObject);
	var id = "abcd";
	var UserContract = require('./userContractSchema.js');
	var Contract = require('./contractSchema.js');
	UserContract.find({ username: 'Chris' }, function(err, user) {
	  if (err) throw err;

	  console.log(user[0].contractAddress);
	  var contractAddress1 = user[0].contractAddress;
	  var abi = JSON.parse(user[0].contractABI);
	  var contractObject = web3.eth.contract(abi);
	  var contractInstance = contractObject.at(contractAddress1);
	  //console.log(contractInstance);
	  Contract.find({ contractAddress: contractAddress1}, function(err, contract) {
	  if (err) throw err;
		
		var mVariables ={};
		contractVariableNames = contract[0].contractVariableNames;
		
		for(var i = 0;i<contractVariableNames.length;++i){

			var variableName = contractVariableNames[i];
			var value = formDataObject[variableName];
			mVariables[variableName] = value;
		}
		console.log(mVariables);
		
		var codeSnippet = " contractInstance.createRecord.sendTransaction(id,"
		for(var i = 0 ; i < contractVariableNames.length;++i){

			codeSnippet += "mVariables."+contractVariableNames[i]+ ","; 
		} 
		codeSnippet+= '{from: web3.eth.accounts[0], gas : 4985667,}, function(error, transactionHash){if (!error){res.send(transactionHash);}else{console.log(error);res.send("Error");}})';
		console.log(codeSnippet);
		console.log(mVariables.name);
		eval(codeSnippet);	  
	});

	});


})



app.get("/getRecord", function(req, res){

		var UserContract = require('./userContractSchema.js');
	var Contract = require('./contractSchema.js');
	UserContract.find({ username: 'Chris' }, function(err, user) {
	  if (err) throw err;

	  console.log(user[0].contractAddress);
	  var contractAddress1 = user[0].contractAddress;
	  var abi = JSON.parse(user[0].contractABI);
	  var contractObject = web3.eth.contract(abi);
	  var contractInstance = contractObject.at(contractAddress1);
	  //console.log(contractInstance);
	console.log(req.query.recordId);
	var recordId = req.query.recordId;
	var data = contractInstance.getRecord.call(recordId);
	console.log(data);
	res.send(data);

});

})
