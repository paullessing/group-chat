var userRepository = require('./user-repository');
var roomRepository = require('./room-repository');
var userRoomRepository = require('./user-room-repository');
var messageService = require('./message-service');

var user = userRepository.create("foo");
var room = roomRepository.create("room1", null);
var room2 = roomRepository.create("room2", null);
var room3 = roomRepository.create("room3", null);

userRoomRepository.join(user.id, room.id);
userRoomRepository.join(user.id, room2.id);

messageService.insertMessage(user.id, 'Some default text', room2.id)
messageService.insertMessage(user.id, 'Some more default text', room2.id)
messageService.insertMessage(user.id, 'Lorem Ipsum Dolor Sit Amet', room3.id)