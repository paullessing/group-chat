function Room(id, name, description) {
	this.id = id;
	this.name = name;
	this.description = description || '';
}

function RoomRepository() {
	this.rooms = [];
}

RoomRepository.prototype.create = function(name, description) {
	var room = new Room(this.rooms.length + 1, name, description);
	this.rooms.push(room);
	return room;
};
	
RoomRepository.prototype.get = function(id) {
	if (id <= this.rooms.length && id >= 1 && this.rooms[id - 1]) {
		return this.rooms[id - 1];
	}
	return null;
};

module.exports = RoomRepository;