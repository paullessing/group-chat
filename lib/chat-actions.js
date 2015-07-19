/**
 * Actions to perform on socket messages.
 * An action with a $ prefix is considered public, all others require a signed in user.
 */

var userRepository = require('./user-repository');
var roomRepository = require('./room-repository');
var messageService = require('./message-service');
var userRoomRepository = require('./user-room-repository');

module.exports = {
	room: {
		create: function(connection, data) {
			console.log("Creating room ", data.roomName);
			var roomName = data.roomName;
			if (!roomName) {
				throw new Error('Not a valid room name!');
			}
			var room = roomRepository.create(data.roomName, data.roomDescription);
			userRoomRepository.join(connection.socket.decoded_token.id, room.id);
			connection.socket.emit('room/create', room);
			listRooms(connection);
		},
		join: function(connection, data) {
			console.log("User joining room");
			var userId = connection.socket.decoded_token.id;
			var roomId = data.roomId;
			ensureValidRoomId(roomId);
			userRoomRepository.join(userId, roomId);
			listRooms(connection);
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
	message: {
		'new': function(connection, data) {
			console.log("New message");
			var userId = connection.socket.decoded_token.id;
			ensureValidRoomId(data.roomId);
			var message = messageService.insertMessage(userId, data.message, data.roomId);
			connection.socket.server.emit('message/new', message); // TODO only broadcast to members of the room
		},
		list: function(connection, data) {
			console.log("Listing messages");
			ensureValidRoomId(data.roomId);
			var messages = messageService.getMessagesInRoom(data.roomId);
			connection.socket.emit('message/list', {
				roomId: data.roomId,
				messages: messages
			});
		}
	},
	server: {
		listRooms: function(connection) {
			console.log("Listing rooms on server");
			listRooms(connection);
		}
	}
};

function ensureValidRoomId(roomId) {
	var room = roomRepository.get(roomId);
	if (room === null) {
		throw new Exception("No such room: " + roomId);
	}
}

// TODO this should be done in a component
function listRooms(connection) {
	connection.socket.emit('server/listRooms', {
		rooms: roomRepository.getAll(),
		joined: userRoomRepository.getRooms(connection.socket.decoded_token.id)
	});
}