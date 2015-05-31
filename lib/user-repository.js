function User(id, username) {
	this.id = id;
	this.username = username;
}

var users = [];

/**
 * Unit tests only.
 */
exports._reset = function() {
	users = [];
}

var create = exports.create = function(username) {
	var user = findByName(username);
	if (!user) {
		user = new User(users.length + 1, username);
		users.push(user);
	}
	return user;
};

var get = exports.get = function(id) {
	if (id <= users.length && id >= 1 && users[id - 1]) {
		return users[id - 1];
	}
	return null;
};

var findByName = exports.findByName = function(username) {
	if (!username) {
		return null;
	}
	var normalUsername = username.toLowerCase();
	for (var i = 0; i < users.length; i++) {
		if (users[i].username.toLowerCase() === normalUsername) {
			return users[i];
		}
	}
	return null;
};