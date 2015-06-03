/**
 * Actions to perform on socket messages.
 * An action with a $ prefix is considered public, all others require a signed in user.
 */

var userService = require('./user-service');
var userRepository = require('./user-repository');
var roomRepository = require('./room-repository');
var userRoomRepository = require('./user-room-repository');

module.exports = {
	user: {
		$signin: function(connection, data) {
			var username = data.username;
			console.log("Signing in user", data.username);
			var user = userService.signIn(username, {});
			if (user !== null) {
				connection.userData = {
					id: user.id
				}
			}
			connection.socket.emit('user/signin', user);
		}
	},
	room: {
		message: function(connection, data) {

		},
		create: function(connection, data) {
			console.log("Creating room");
			var roomName = data.roomName;
			if (!roomName) {
				throw new Error('Not a valid room name!');
			}
			var room = roomRepository.create(data.roomName, data.roomDescription);
			userRoomRepository.join(connection.userData.id, room.id);
			connection.socket.emit('room/create', room);
			connection.socket.server.emit('server/listRooms', roomRepository.getAll());
		},
		join: function(connection, data) {
			console.log("User joining room");
			var userId = connection.userData.id;
			var roomId = data.roomId;
			ensureValidRoomId(roomId);
			var result = userRoomRepository.join(userId, roomId);
		},
		listUsers: function(connection, data) {
			console.log("Listing users in room");
			var roomId = data.roomId;
			ensureValidRoomId(roomId);
			var userIds = userRoomRepository.getUsers(roomId);
			var users = [];
			userIds.forEach(function(userId) {
				users.push(userRepository.get(userId));
			});
			connection.socket.emit('room/listUsers', users);
		}
	},
	server: {
		listRooms: function(connection, data) {
			console.log("Listing rooms on server");
			connection.socket.emit('server/listRooms', roomRepository.getAll());
		},
	}
};

function ensureValidRoomId(roomId) {
	var room = roomRepository.get(roomId);
	if (room === null) {
		throw new Exception("No such room: " + roomId);
	}
}