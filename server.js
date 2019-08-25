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


//SOCKET HANDLING
io.on("connection",(socket)=>{
	console.log("+ CONNECTED: ",socket.id);

	socket.on("sendSignal",(data)=>{socket.broadcast.emit("receivedSignal",data);});

	socket.on("disconnect",()=>{console.log("- DISCONNECTED: ",socket.id);});
});

httpServer.listen(PORT, ()=>{console.log(`HTTP SERVER UP ON PORT: ${PORT}`);});