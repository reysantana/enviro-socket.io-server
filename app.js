var cluster = require('cluster');

if (cluster.isMaster) {
	cluster.fork();

	cluster.on('exit', function(worker, code, signal) {
		cluster.fork();
	});
}

if (cluster.isWorker) {
	const express = require('express');
	const app = express();
	const server = require('http').createServer(app);
	const io = require('socket.io').listen(server);
	const bodyParser = require("body-parser");

	let allClients = [];
	let shareIDs = [];
	let shareIndex = 0;

	app.set('port', process.env.PORT || 3000);

	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	io.on('connection', function (socket) {

		socket.on('Connected', function (data) {

			let client = {
				id: socket.id, 
				phone: data.phone
			}

			for (let i = 0; i < allClients.length; i ++) {
				if (allClients[i].id == client.id)
					return;
			}

			allClients.push(client);

			console.log(socket.id + " Connected [Phone: " + client.phone + "]");
		});

		socket.on('Share', function (data) {

			console.log("Share");

			let json = {
				HouseType: data.HouseType, 
				RoofType: data.RoofType, 
				BrickType: data.BrickType, 
				BigDogs: data.BigDogs, 
				SmallDogs: data.SmallDogs, 
				Cats: data.Cats, 
				SportBalls: data.SportBalls, 
				YardSign: data.YardSign, 
				PanelCount: data.PanelCount, 
				PercentSavings: data.PercentSavings, 
				AverageBill: data.AverageBill, 
				SharedBy: data.SharedBy, 
				SharedTo: data.SharedTo
			}

			// let index = -1;

			// for (let i = 0; i < allClients.length; i ++) {
			// 	if (allClients[i].phone == data.SharedTo) {
			// 		index = i;
			// 		break;
			// 	}
			// }

			// if (index == -1)
			// 	return;

			shareIDs.push(shareIndex);
			shareIndex ++;

			io.sockets.emit("UpdateJSON", data);		
		});

		socket.on('disconnect', function() {

			let index = -1;
			
			for (let i = 0; i < allClients.length; i ++) {
				if (allClients[i].id == socket.id) {
					index = i;
					break;
				}
			}
			
			if (index == -1)
				return;

			console.log(socket.id + " Disconnected [Phone: " + allClients[index].phone + "]");

			allClients.splice(index, 1);
		});

		socket.on('Received', function() {

		});

		socket.on('Fetch', function() {

		});
	});

	server.listen(app.get('port'), function(){
		console.log("Envirosolar Socket Server is running at Port " + app.get('port') + "\n");
	});
}
