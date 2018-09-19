const Util = {
	/**
	 * Utility for generating class names according to a set of conditions
	 * @param prefix either a string that will be prefixed as is, or an array of strings to be joined. Any other type will be cast to string (if given an array of non-strings then each value in the array will be cast to String)
	 * @param spec Object: the keys are class names and each value should be truthy if this class should be enabled or falsy otherwise
	 * @returns {string} the final class name attribute that can be safely included in the DOM
	 */
	cls: function (prefix, spec) {
		// Default value for `prefix`
		if (!prefix) {
			prefix = ''
		}
		// If there is only one argument then it's assumed to be the spec
		if (!spec) {
			spec = prefix
			prefix = ''
		}
		// The `prefix` can be either array or String (or other)
		if (prefix instanceof Array) {
			prefix = prefix.join(' ')
		} else {
			prefix = String(prefix)
		}
		// prefix is now a String. If not empty, pad it with a space
		if (prefix.length) {
			prefix += ' '
		}
		return prefix + Object.entries(spec) // append the prefix
			.filter(([className, value]) => value) // filter out falsy values
			.map(([className, value]) => className) // leave only the class name
			.join(' ') // space-separated
	},
}
