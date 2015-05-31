function UserInRoom(userId, roomId) {
	this.userId = userId;
	this.roomId = roomId;
}

function UserRoomRepository() {
	this.usersInRooms = [];
}

/**
 * Add this user to the given room, if they are not already a member.
 * @return {boolean} Whether the user was added to the room.
 */
UserRoomRepository.prototype.join = function(userId, roomId) {
	if (!isUserInRoom(this, userId, roomId)) {
		this.usersInRooms.push(new UserInRoom(userId, roomId));
		return true;
	}
	return false;
}

/**
 * Get a list of all rooms this user is a member of.
 * @return {!number[]} List of room IDs
 */
UserRoomRepository.prototype.getRooms = function(userId) {
	var rooms = [];
	for (var i = 0; i < this.usersInRooms.length; i++) {
		if (this.usersInRooms[i].userId === userId) {
			rooms.push(this.usersInRooms[i].roomId);
		}
	}
	return uniqueEntries(rooms);
}

/**
 * Get a list of all rooms.
 * @return {!number[]} List of room IDs
 */
UserRoomRepository.prototype.getAllRooms = function() {
	var rooms = [];
	for (var i = 0; i < this.usersInRooms.length; i++) {
		rooms.push(this.usersInRooms[i].roomId);
	}
	return uniqueEntries(rooms);
}

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

function isUserInRoom(repository, userId, roomId) {
	for (var i = 0; i < repository.usersInRooms.length; i++) {
		var userInRoom = repository.usersInRooms[i];
		if (userInRoom.userId === userId && userInRoom.roomId === roomId) {
			return true;
		}
	}
	return false;
}

module.exports = UserRoomRepository;