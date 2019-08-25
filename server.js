/*
roomStat - send {room, usercount}
userDisconnecting - send {socketid}
*/

const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

//CONFIG VARIABLES
const PORT = process.env.PORT || 3000;
const IP4 = "192.168.1.100";

var app = express();
var httpServer = http.Server(app);
var io = socketIO(httpServer); 

app.use(express.static(path.join(__dirname,'/routes/public/')));

//SOCKET HANDLING
io.on("connection",async (socket,data)=>{
	console.log("+ CONNECTED: ",socket.id);

	//ROOM
	socket.on("joinRoom",async (data)=>{
		if(socket.room){
			io.to(socket.room).emit('roomStat',{room: socket.room, usercount: io.sockets.adapter.rooms[socket.room].length-1});
			await socket.leave(socket.room);
			console.log(`--  ${socket.id} LEAVING |${socket.room}|`);
		}
		socket.room = data.roomName;
		await socket.join(socket.room);
		io.to(socket.room).emit('roomStat',{room: socket.room, usercount: io.sockets.adapter.rooms[socket.room].length});
		console.log(`++  ${socket.id} JOINING |${socket.room}|`);
	});

	//HANDLE DISCONNECTION
	socket.on("disconnect",async ()=>{
		if(socket.room && io.sockets.adapter.rooms[socket.room]){
			io.to(socket.room).emit('userDisconnecting',{socketid: socket.id});
			io.to(socket.room).emit('roomStat',{room: socket.room, usercount: io.sockets.adapter.rooms[socket.room].length});
			await socket.leave(socket.room);
		}
		console.log("- DISCONNECTED: ",socket.id);
	});
});

httpServer.listen(PORT, ()=>{console.log(`HTTP SERVER UP ON PORT: ${PORT}`);});