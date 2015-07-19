var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

var Connection;

describe('Connection', function() {
	var chatActions = {};
	var socket = {
		on: sinon.stub(),
		emit: sinon.stub(),
		decoded_token: { id: 17 }
	};
	var noop = function() {};
	var data = {};
	
	before(function() {
		mockery.enable();
		mockery.registerMock('./chat-actions', chatActions);
		mockery.registerAllowable('../lib/connection');
		Connection = require('../lib/connection');
	});
	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});
	beforeEach(function() {
		for (var member in chatActions) {
			if (chatActions.hasOwnProperty(member)) {
				delete chatActions[member];
			}
		}
		socket.on.reset();
		socket.emit.reset();
		delete socket.decoded_token;
	});
	
	describe('#__construct()', function() {
		it('should set the socket passed', function() {
			var connection = new Connection(socket);
			assert.strictEqual(socket, connection.socket);
		});
		it('should initialise with empty userData', function() {
			var connection = new Connection(socket);
			assert.strictEqual(null, connection.userData);
		});
		it('should create a callback on socket with for each member of chatActions', function() {
			chatActions.firstNamespace = {
				firstAction: noop,
				secondAction: noop
			};
			chatActions.secondNamespace = {
				thirdAction: noop,
				fourthAction: noop
			};
			
			new Connection(socket);
			
			assert.equal(4, socket.on.callCount);
			assert.ok(socket.on.calledWith('firstNamespace/firstAction'));
			assert.ok(socket.on.calledWith('firstNamespace/secondAction'));
			assert.ok(socket.on.calledWith('secondNamespace/thirdAction'));
			assert.ok(socket.on.calledWith('secondNamespace/fourthAction'));
		});
		it('should bind events to the socket which call through to the correct methods of callActions', function() {
			// This test ensures that when binding on() calls to socket, we don't accidentally bind all events to one call
			chatActions.firstNamespace = {
				firstAction: sinon.stub(),
				secondAction: sinon.stub()
			};
			chatActions.secondNamespace = {
				thirdAction: sinon.stub()
			};

			var connection = new Connection(socket);
			connection.userData = {}; // User is considered signed in when userData is set
			
			// Call all three actions
			socket.on.firstCall.args[1](data);
			socket.on.secondCall.args[1](data);
			socket.on.thirdCall.args[1](data);

			// Ensure all actions were called (rather than one action thrice)
			assert.ok(chatActions.firstNamespace.firstAction.calledOnce);
			assert.ok(chatActions.firstNamespace.secondAction.calledOnce);
			assert.ok(chatActions.secondNamespace.thirdAction.calledOnce);
			
			// Ensure the actions were called in the right order
			sinon.assert.callOrder(
					chatActions.firstNamespace.firstAction,
					chatActions.firstNamespace.secondAction,
					chatActions.secondNamespace.thirdAction);
		});
	});
});