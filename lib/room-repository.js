function Room(id, name, description) {
	this.id = id;
	this.name = name;
	this.description = description || '';
}

var rooms = [];

/**
 * Unit tests only.
 */
exports._reset = function() {
	rooms = [];
}

var create = exports.create = function(name, description) {
	var room = new Room(rooms.length + 1, name, description);
	rooms.push(room);
	return room;
};
	
var get = exports.get = function(id) {
	if (id <= rooms.length && id >= 1 && rooms[id - 1]) {
		return rooms[id - 1];
	}
	return null;
};