var mockery = require('mockery');
var assert = require('assert');
var sinon = require('sinon');

var Connection;

describe('Connection', function() {
	var chatActions = {};
	var socket = {
		on: sinon.stub(),
		emit: sinon.stub()
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
	});
	
	describe('#__construct()', function() {
		it('should set the socket passed', function() {
			var connection = new Connection(socket);
			assert.strictEqual(socket, connection.socket);
		});
		it('should initialise with empty userData', function() {
			var connection = new Connection(socket);
			assert.strictEqual(null, connection.userData);
		})
		it('should create a callback on socket with for each member of chatActions', function() {
			chatActions.firstNamespace = {
				firstAction: noop,
				secondAction: noop,
			};
			chatActions.secondNamespace = {
				thirdAction: noop,
				fourthAction: noop,
			};
			
			new Connection(socket);
			
			assert.equal(4, socket.on.callCount);
			assert.ok(socket.on.calledWith('firstNamespace/firstAction'));
			assert.ok(socket.on.calledWith('firstNamespace/secondAction'));
			assert.ok(socket.on.calledWith('secondNamespace/thirdAction'));
			assert.ok(socket.on.calledWith('secondNamespace/fourthAction'));
		});
		it('should create a callback on socket removing the $ prefix', function() {
			chatActions.namespace = {
				$member: noop,
			};
			
			new Connection(socket);

			assert.ok(socket.on.calledOnce, 'socket.on called once');
			assert.ok(socket.on.calledWith('namespace/member'), 'socket.on called with the right parameters');
		});
		it('should call through to unsecured methods when socket emits event even if the user is not signed in', function() {
			var method = sinon.stub();
			chatActions.unsecured = {
				$doIt: method
			};
			var connection = new Connection(socket);
			var callback = socket.on.firstCall.args[1];
			callback(data);
			
			assert.ok(method.calledOnce);
			assert.ok(method.calledWithExactly(connection, data));
		});
		it('should not call through to secured methods, and emit an error, on a secured event when the user is not signed in', function() {
			var method = sinon.stub();
			chatActions.secured = {
				doIt: method
			};
			var connection = new Connection(socket);
			socket.emit.reset(); // Reset the constructor call
			var callback = socket.on.firstCall.args[1];
			
			callback(data);
			assert.ok(!method.called);
			assert.ok(socket.emit.calledOnce);
			assert.ok(socket.emit.calledWith('system/error'));
		});
		it('should call through to secured methods when socket emits event when the user is signed in', function() {
			var method = sinon.stub();
			chatActions.secured = {
				doIt: method
			};
			var connection = new Connection(socket);
			connection.userData = {}; // User is considered signed in when userData is set
			var callback = socket.on.firstCall.args[1];
			
			callback(data);
			assert.ok(method.calledOnce);
			assert.ok(method.calledWithExactly(connection, data));
		});
		it('should bind events to the socket which call through to the correct methods of callActions', function() {
			// This test ensures that when binding on() calls to socket, we don't accidentally bind all events to one call
			chatActions.firstNamespace = {
				firstAction: sinon.stub(),
				secondAction: sinon.stub(),
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
		it('should emit a require-auth message after construction', function() {
			chatActions.namespace = {
				firstAction: sinon.stub()
			};

			new Connection(socket);

			assert.ok(socket.on.called);
			assert.ok(socket.emit.calledOnce);
			assert.ok(socket.emit.calledWithExactly('user/require-auth'));
			sinon.assert.callOrder(socket.on, socket.emit);
		});
	});
});