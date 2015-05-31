var userRepository = require('./user-repository');

exports.signIn = function(username, details) {
	var user = userRepository.findByName(username);
	if (user === null) {
		// Create user if he doesn't exist - in future this will require registration
		user = userRepository.create(username);
	}
	// TODO check password
	return user;
};