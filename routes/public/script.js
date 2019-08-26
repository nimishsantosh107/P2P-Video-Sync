/*
signal - send {peerid}
returnSignal - send {destSocket, this.peerid}
leaving - send {peerid} 
*/

function updateCounter(count) {connectedCounter.innerText = `CONNECTED: ${count}`;}

function deletePeer(peerid) {
	var index = -1;
	for(var i = 0 ; i < peersList.length ; i++){
		if(peersList[i].peerid === peerid)
			index = i;
	}
	if (index !== -1)
		peersList.splice(index,1);
}

function deleteConnObj(peerid) {
	var index = -1;
	for(var i = 0 ; i < connObjList.length ; i++){
		if(connObjList[i].peer === peerid)
			index = i;
	}
	if (index !== -1)
		connObjList.splice(index,1);
}

function sendMessage() {
	var msg = messageSendText.value;
	updateMessageList(msg);
	connObjList.forEach(function (connObj) {
		connObj.send(msg);
	});
}

function updateMessageList(msg) {
	var p = document.createElement("p");
	p.innerText = msg;
	messages.append(p);
}

var socket = io(window.location.origin);
var peer = null;
var peersList = [];
var connObjList = [];

socket.on('connect', function () {
	console.log('CONNECTED');

	//JOIN A ROOM
	roomJoinButton.addEventListener('click', async function () {
		if(roomName.value === "")
			alert("Room name empty");
		else{
			//PEER LEAVING CURRENT ROOM / JOINING NEW
			peersList = [];
			connObjList = [];
			if(socket.room){
				messages.innerHTML = "";
				socket.emit('leaving', {peerid: peer.id});
			}
			socket.room = roomName.value;
			socket.emit('joinRoom',{roomName: socket.room});

			//P2P
			peer = await new Peer();

			//INIT PEER ID & SIGNAL
			peer.on('open', function (id) {
				peer.id = id;
				socket.emit('signal',{peerid: peer.id});
				messageContainer.style.display = "block";
				console.log(`PEER ID: ${peer.id}`);
			});

			//RECIEVE CONNECTION ***********
			peer.on('connection', function (conn) {
				//SET DATA LISTENER 
			  	conn.on('data', function(data) {
			  		updateMessageList("PEER: "+data);
			  	});
				//PUSH CONN TO CONN LIST FINALLY
				connObjList.push(conn);							
			});
		}
	});

	//DISPLAY NUMBER OF CONNECTED USERS
	//GET {room, usercount}
	socket.on('roomStat', function (data) {
		updateCounter(data.usercount);
		console.log(data);
	});

	//GET NEW PEER CONNECTION AND MAKE CONNECTION TO NEW CLIENT
	socket.on('newSignal', async function (data) {
		peersList.push(data);
		//CONNECT TO PEER
		var conn = await peer.connect(data.peerid);
		//CONN METHODS  ***********
		conn.on('open', function () {
			//SET DATA LISTENER
		  	conn.on('data', function(data){
		  		updateMessageList("PEER: "+data);
		  	});	
			//PUSH TO PEER OBJ LIST
			connObjList.push(conn);
		});

		socket.emit('returnSignal', {destSocket: data.socketid, peerid: peer.id});
	});

	socket.on('newReturnSignal', function (data) {
		peersList.push(data);
		//PRINT PEERSLIST AFTER ALL USERS JOIN
	});

	//DELETE LEFT USER FROM PEERSLIST
	socket.on('newLeaving', function (data) {
		deletePeer(data.leftPeerid);
		deleteConnObj(data.leftPeerid);
		console.log(`${data.leftPeerid} LEFT THE ROOM`);
	});
});