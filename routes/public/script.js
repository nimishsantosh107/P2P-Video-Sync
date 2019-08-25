/*
signal - send {peerid}
returnSignal - send {destSocket, this.peerid}
leaving - send {peerid} 
*/

function updateCounter(count) {connectedCounter.innerText = `CONNECTED: ${count}`;}

var socket = io(window.location.origin);
var peer = null;
var peersList = [];

socket.on('connect', function () {
	console.log('CONNECTED');

	//JOIN A ROOM
	roomJoinButton.addEventListener('click', async function () {
		if(roomName.value === "")
			alert("Room name empty");
		else{
			//PEER LEAVING CURRENT ROOM / JOINING NEW
			peersList = [];
			if(socket.room)
				socket.emit('leaving', {peerid: peer.id});
			socket.room = roomName.value;
			socket.emit('joinRoom',{roomName: socket.room});

			//P2P
			peer = await new Peer();

			//INIT PEER ID & SIGNAL
			peer.on('open', function (id) {
				peer.id = id;
				socket.emit('signal',{peerid: peer.id});
				console.log(`PEER ID: ${peer.id}`);
			});
		}
	});

	//DISPLAY NUMBER OF CONNECTED USERS
	//GET {room, usercount}
	socket.on('roomStat', function (data) {
		updateCounter(data.usercount);
		console.log(data);
	});

	//ACCEPT NEW PEER CONNECTION
	socket.on('newSignal', function (data) {
		peersList.push(data);
		socket.emit('returnSignal', {destSocket: data.socketid, peerid: peer.id});
	});

	socket.on('newReturnSignal', function (data) {
		peersList.push(data);
		//PRINT PEERSLIST AFTER ALL USERS JOIN
	});

	//DELETE LEFT USER FROM PEERSLIST
	socket.on('newLeaving', function (data) {
		peersList.pop(data.leftPeerid); //****************************************
		console.log(`${data.leftPeerid} LEFT THE ROOM`);
	});
});