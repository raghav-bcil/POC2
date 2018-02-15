
function addRecord()
{
	var formData = {};
	formData.name = document.getElementById("name").value;
	formData.email = document.getElementById("email").value;
	formData.contact = document.getElementById("contact").value;

	var formDataTemp = JSON.stringify(formData);

	$.post("/addRecord",{ formData : formDataTemp },function(data){
		if(data == "Error")
		{
			$("#message").text("An error occured.");
		}
		else
		{
			$("#message").html("Transaction hash: " + data);
		}
	});

}


function getRecord()
{
	var recordId = document.getElementById("id").value;

	$.get("/getRecord?recordId=" + recordId , function(data){
		if(data == "")
		{
			$("#message").text("No Record found for this record Id");
		}
		else
		{
			$("#message").html("Record Info: " + data);
		}
	});

}



// var socket = io("http://52.226.73.240:8080");

// socket.on("connect", function () {
// 	socket.on("message", function (msg) {
// 		if($("#events_list").text() == "No Transaction Found")
// 		{
// 			$("#events_list").html("<li>Txn Hash: " + msg.transactionHash + "\nRecord Id: " + msg.args.entry1 + "</li>");
// 		}
// 		else 
// 		{
// 			$("#events_list").prepend("<li>Txn Hash: " + msg.transactionHash + "\nRecord Id: " + msg.args.entry1 + "</li>");
// 		}
//     });
// });