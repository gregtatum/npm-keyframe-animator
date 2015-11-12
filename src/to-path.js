// Adapted from the internals of lodash, see node_modules/lodash.isarray for license information

var isArray = require('lodash.isarray')

function baseToString(value) {
	if (typeof value == 'string') {
		return value;
	}
	return value == null ? '' : (value + '');
}

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

// Converts `value` to property path array if it is not one.
function toPath(value) {
	if (isArray(value)) {
		return value;
	}
	var result = [];
	baseToString(value).replace(rePropName, function(match, number, quote, string) {
		result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
	});
	return result;
}

module.exports = toPath;
