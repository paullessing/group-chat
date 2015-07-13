var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-=_+!"$%^&*()[]{}\';:#~,.<>/?\\|';

function generateSalt(length) {
	if (typeof length !== "number") {
		length = 16;
	}
	var result = new Array(length);
	for (var i = 0; i < length; i++) {
		var r =  Math.floor(Math.random() * charset.length);
		result[i] = charset[r];
	}
	return result.join('');
}

module.exports = generateSalt;