var io = require('socket.io')(3000);
console.log("Server running on port 3000");

var Connection = require('./lib/connection');

io.on('connection', function (socket) {
	new Connection(socket);
});