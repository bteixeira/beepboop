const EventEmitter = require('events').EventEmitter;

class StreamWrapper extends EventEmitter {

	constructor(writable, readable) {
		super();

		// TODO IT'S PROBABLY A BAD IDEA TO EMIT 2 close EVENTS, ESPECIALLY WHEN THE DOCS SAY THAT NO EVENTS SHOULD BE EMITTED AFTER close

		if (writable) {
			/* Propagate all events from the writable stream */
			'close drain error finish pipe unpipe'.split(' ').forEach(event => {
				writable.on(event, (...params) => {
					params.unshift(event);
					this.emit.apply(this, params);
				});
			});

			/* Delegate all Writable method calls */
			'cork end setDefaultEncoding uncork write'.split(' ').forEach(method => {
				this[method] = function (...params) {
					return writable[method].apply(writable, params);
				};
			});
		}

		if (readable) {
			/* Propagate all events from the readable stream */
			'close data end error readable'.split(' ').forEach(event => {
				readable.on(event, (...params) => {
					params.unshift(event);
					this.emit.apply(this, params);
				});
			});

			/* Delegate all Readable method calls */
			'isPaused pause pipe read resume setEncoding unpipe unshift'/* wrap?*/.split(' ').forEach(method => {
				this[method] = function (...params) {
					return readable[method].apply(readable, params);
				};
			});
		}

	}

}

module.exports = StreamWrapper;