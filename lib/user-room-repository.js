function UserInRoom(userId, roomId) {
	this.userId = userId;
	this.roomId = roomId;
}

var usersInRooms = [];

/**
 * Unit testing only
 */
exports._reset = function() {
	usersInRooms = [];
}

/**
 * Add this user to the given room, if they are not already a member.
 * @return {boolean} Whether the user was added to the room.
 */
var join = exports.join = function(userId, roomId) {
	if (!isUserInRoom(userId, roomId)) {
		usersInRooms.push(new UserInRoom(userId, roomId));
		return true;
	}
	return false;
};

/**
 * Get a list of all rooms this user is a member of.
 * @return {!number[]} List of room IDs
 */
var getRooms = exports.getRooms = function(userId) {
	var rooms = [];
	for (var i = 0; i < usersInRooms.length; i++) {
		if (usersInRooms[i].userId === userId) {
			rooms.push(usersInRooms[i].roomId);
		}
	}
	return uniqueEntries(rooms);
};

/**
 * Get a list of all occupied rooms.
 * @return {!number[]} List of room IDs
 */
var getAllRooms = exports.getAllRooms = function() {
	var rooms = [];
	for (var i = 0; i < usersInRooms.length; i++) {
		rooms.push(usersInRooms[i].roomId);
	}
	return uniqueEntries(rooms);
};

var getUsers = exports.getUsers = function(roomId) {
	var users = [];
	usersInRooms.forEach(function(userInRoom) {
		if (userInRoom.roomId === roomId) {
			users.push(userInRoom.userId);
		}
	});
	return uniqueEntries(users);
};

/**
 * Given an array, returns a list of unique entries in that array.
 */
function uniqueEntries(list, comparator) {
	if (typeof comparator !== 'function') {
		comparator = function(a, b) {
			return a === b;
		}
	}
	var listCopy = list.slice();
	listCopy.sort();
	var result = [];
	for (var i = 0; i < listCopy.length; i++) {
		var entry = listCopy[i]
		if (result.length === 0 || !comparator(result[result.length - 1], entry)) {
			result.push(entry);
		}
	}
	return result;
}

function isUserInRoom(userId, roomId) {
	for (var i = 0; i < usersInRooms.length; i++) {
		var userInRoom = usersInRooms[i];
		if (userInRoom.userId === userId && userInRoom.roomId === roomId) {
			return true;
		}
	}
	return false;
}