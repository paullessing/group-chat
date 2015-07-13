var io = require('socket.io')(3000);
console.log("Server running on port 3000");

var Connection = require('./lib/connection');

io.on('connection', function (socket) {
	new Connection(socket);
});

require('./lib/fixtures');

var tokenService = require('./lib/token-service');
for (var i = 0; i < 10; i++) {
	var token = tokenService.create('foo');
	console.log(token, tokenService.verify(token));
}
