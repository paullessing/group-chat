var actions = require('./chat-actions');

function Connection(socket) {
	this.socket = socket;
	this.userData = null;
	
	attachListeners(this);
}

function attachListeners(connection) {
	for (namespace in actions) {
		if (!actions.hasOwnProperty(namespace)) {
			continue;
		}
		var namespaceObject = actions[namespace];
		for (action in namespaceObject) {
			if (!namespaceObject.hasOwnProperty(action)) {
				continue;
			}
			var actionObject = namespaceObject[action];
			var requireSignin = true;
			if (action[0] === '$') {
				action = action.slice(1);
				requireSignin = false;
			}
			connection.socket.on(namespace + '/' + action, function(data) {
				doCall(connection, requireSignin, actionObject, data);
			});
		}
	}
}

function doCall(connection, requireSignin, action, data) {
	if (requireSignin && !isSignedIn(connection)) {
		throw new Error('Must be signed in to do that!');
	}
	action.call(null, connection, data);
}

function isSignedIn(connection) {
	return connection.userData !== null;
}

module.exports = Connection;