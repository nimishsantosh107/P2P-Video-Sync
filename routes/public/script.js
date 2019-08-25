/*
signal - send {peerid}
*/

function updateCounter(count) {connectedCounter.innerText = `CONNECTED: ${count}`;}

var socket = io(window.location.origin);
var peer = null;

socket.on('connect', function () {
	console.log('CONNECTED');

	//JOIN A ROOM
	roomJoinButton.addEventListener('click', function () {
		if(roomName.value === "")
			alert("Room name empty");
		else{
			socket.room = roomName.value;
			socket.emit('joinRoom',{roomName: socket.room});

			//P2P
			var peer = new Peer();

			//INIT PEER ID & SIGNAL
			peer.on('open', function (id) {
				peer.id = id;
				socket.emit('signal',{peerid: peer.id})
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
		console.log(data);
	});

	//USER DISCONNECTION
	//GET {socketid}
	socket.on('userDisconnecting', function (data) {console.log(data);});
});