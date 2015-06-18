'use strict';

var chatApp = angular.module('chatApp', [
	'btford.socket-io',
]);
chatApp.factory('chatSocket', function (socketFactory) {
	return socketFactory({ ioSocket: io('http://localhost:3000') });
});
chatApp.controller('ChatController', function($scope, chatSocket) {
	var lastRoom = -1;
	$scope.name = 'Waffle';

	$scope.signinForm = {
		username: ''
	};
	
	$scope.user = null;
	$scope.rooms = [];
	
	$scope.newRoom = {
		name: '',
		description: ''
	};
	$scope.newMessage = {
		text: ''
	}
	
	$scope.messages = [];
	
	$scope.signin = function() {
		console.log("Signin in with username", $scope.signinForm.username);
		chatSocket.emit('user/signin', { username: $scope.signinForm.username });
	};
	
	$scope.createRoom = function() {
		console.log("Creating room!");
		chatSocket.emit('room/create', { roomName: $scope.newRoom.name, roomDescription: $scope.newRoom.description });
		$scope.newRoom.name = '';
		$scope.newRoom.description = '';
	};
	
	$scope.send = function() {
		chatSocket.emit('room/newMessage', { roomId: lastRoom, message: $scope.newMessage.text });
		$scope.newMessage.text = '';
	};

	chatSocket.on('user/signin', function(user) {
		$scope.user = user;
		chatSocket.emit("server/listRooms");
	});
	chatSocket.on('server/listRooms', function(data) {
		$scope.rooms = data;
	});
	chatSocket.on('room/create', function(room) {
		console.log('Sroom/create', room);
		lastRoom = room.id;
	});
	chatSocket.on('system/error', function(error) {
		console.log("Error:", error);
	});
	chatSocket.on('room/message', function(message) {
		$scope.messages.push(message);
	});
});