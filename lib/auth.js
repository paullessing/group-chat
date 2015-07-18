var jwt = require('jsonwebtoken');
var jwtSecret = 'foo bar!'; //TODO
var Connection = require('./connection');
var userService = require('./user-service');


exports.signIn = function(userData) {
    var user  = userService.signIn(userData.username, userData);

    // TODO: validate the actual user user
    var profile = {
        username: user.username,
        id: user.id
    };

    // we are sending the profile in the token
    var token = jwt.sign(profile, jwtSecret, { expiresInMinutes: 60*5 });

    return token;
}

exports.secure = function (socketio) {

	socketio.on('connection', function(socket){

		//temp delete socket from namespace connected map
		delete socketio.sockets.connected[socket.id];

		var options = {
			secret: jwtSecret,
			timeout: 5000 // 5 seconds to send the authentication message
		}

		var auth_timeout = setTimeout(function () {
			socket.disconnect('unauthorized');
		}, options.timeout || 5000);

		var authenticate = function (data) {

			clearTimeout(auth_timeout);
			jwt.verify(data.token, options.secret, options, function(err, decoded) {
				if (err){
					socket.disconnect('unauthorized');
				}
				if (!err && decoded){
					//restore temporarily disabled connection
					socketio.sockets.connected[socket.id] = socket;

					socket.decoded_token = decoded;
					socket.connectedAt = new Date();

					// Disconnect listener
					socket.on('disconnect', function () {
						console.info('SOCKET [%s] DISCONNECTED', socket.id);
					});

					console.info('SOCKET [%s] CONNECTED', socket.id);
					socket.emit('authenticated');
                    new Connection(socket);
				}
			})
		}

		socket.on('authenticate', authenticate );
	});
};