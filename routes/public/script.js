function updateCounter(count) {connectedCounter.innerText = `CONNECTED: ${count}`;}

var socket = io(window.location.origin);

socket.on('connect', function () {
	console.log('CONNECTED');

	//JOIN A ROOM
	roomJoinButton.addEventListener('click', function () {
		if(roomName.value === "")
			alert("Room name empty");
		else{
			socket.room = roomName.value;
			socket.emit('joinRoom',{roomName: socket.room});
		}
	});

	//DISPLAY NUMBER OF CONNECTED USERS
	//GET {room, usercount}
	socket.on('roomStat', function (data) {
		console.log(data);
		updateCounter(data.usercount);
	});

	//USER DISCONNECTION
	//GET {socketid}
	socket.on('userDisconnecting', function (data) {console.log(data);});
});