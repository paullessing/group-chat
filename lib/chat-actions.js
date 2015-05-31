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
			var user = userService.signIn(username, {});
			if (user !== null) {
				connection.userData = {
					id: user.id
				}
			}
		}
	},
	room: {
		message: function(connection, data) {

		},
		join: function(connection, data) {
			var userId = connection.userData.id;
			var roomId = data.roomId;
			ensureValidRoomId(roomId);
			var result = userRoomRepository.join(userId, roomId);
		},
		listUsers: function(connection, data) {
			var roomId = data.roomId;
			ensureValidRoomId(roomId);
			var userIds = userRoomRepository.getUsers(roomId);
			var users = [];
			userIds.forEach(function(userId) {
				users.push(userRepository.get(userId));
			});
			return users;
		}
	},
	server: {
		listRooms: function(connection, data) {
			return roomRepository.getAll();
		},
	}
};

function ensureValidRoomId(roomId) {
	var room = roomRepository.get(roomId);
	if (room === null) {
		throw new Exception("No such room: " + roomId);
	}
}