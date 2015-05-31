function Room(id, name, description) {
	this.id = id;
	this.name = name;
	this.description = description || '';
}

function RoomRepository() {
	var self = this;
	var rooms = [];
	
	this.create = function(name, description) {
		var room = new Room(rooms.length + 1, name, description);
		rooms.push(room);
		return room;
	};
	
	this.get = function(id) {
		if (id <= rooms.length && id >= 1 && rooms[id - 1]) {
			return rooms[id - 1];
		}
		return null;
	};
}

module.exports = RoomRepository;