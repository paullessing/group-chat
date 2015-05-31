/**
 * Actions to perform on socket messages.
 * An action with a $ prefix is considered public, all others require a signed in user.
 */

var userService = require('./user-service');
var roomRepository = require('./room-repository');

module.exports = {
	user: {
		$signin: function(connection, data) {
			var username = data.username;
			var user = userService.signIn(username, {});
			return user;
		}
	},
	room: {
		message: function(connection, data) {

		},
		join: function(connection, data) {

		},
		listUsers: function(connection, data) {

		}
	},
	server: {
		listRooms: function(connection, data) {
			return roomRepository.getAll();
		},
	}
};