var roomRepository = require('../lib/room-repository');
var assert = require("assert");

describe('RoomRepository', function(){
	beforeEach(function() {
		roomRepository._reset();
	});
	
	describe('#create()', function() {
		it('should create a new room with the correct name and description', function() {
			var name = 'room';
			var description = 'foo bar';
			
			var room = roomRepository.create(name, description);
			
			assert.strictEqual(name, room.name);
			assert.strictEqual(description, room.description);
			assert.ok(room.id > 0);
		});
		it('should default to an empty string for description if no description is passed', function() {
			var name = 'room';
			var room = roomRepository.create(name);
			assert.strictEqual('', room.description);
		});
		it('should default to an empty string for description if null is passed for the description', function() {
			var name = 'room';
			var room = roomRepository.create(name, null);
			assert.strictEqual('', room.description);
		});
		it('should create new instances for rooms even if the name is the same', function() {
			var name = 'room';
			var room1 = roomRepository.create(name);
			var room2 = roomRepository.create(name);

			assert.notEqual(room1.id, room2.id);
		});
	});
	
	describe('#get()', function() {
		it('should return null when called with a zero ID', function() {
			assert.strictEqual(null, roomRepository.get(0));
		});
		it('should return a room when a room with that ID exists', function() {
			var room = roomRepository.create('room');
			var id = room.id;
			
			var result = roomRepository.get(id);
			
			assert.deepEqual(room, result);
		});
		it('should return null when the ID is larger than the maximum ID', function() {
			roomRepository.create('room1');
			roomRepository.create('room2');
			var lastRoom = roomRepository.create('room3');
			assert.strictEqual(null, roomRepository.get(lastRoom.id + 1));
		});
	});
});