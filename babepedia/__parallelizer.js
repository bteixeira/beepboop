var stream = require('stream');
var util = require('util');

var Parallelizer = function (count, Class) {
	stream.Transform.call(this, {objectMode: true});
	var consumers = [];
	var available = [];

	if (typeof count === 'number') {
		for (var i = 0; i < count; i++) {
			consumers.push(new Class());
		}
	} else {
		count.forEach(consumer => {
			consumers.push(consumer);
		});
	}

	var open = consumers.length;
	var out = new stream.PassThrough({objectMode: true});

	function closeConsumer() {
		open -= 1;
		if (open <= 0) {
			out.end();
		}
	}

	consumers.forEach(consumer => {
		available.push(consumer);
		consumer.pipe(out, {end: false});
		consumer.on('end', closeConsumer);
	});

	var me = this;

	this._transform = function (chunk, encoding, callback) {
		//console.log('FAN received chunk ' + chunk);
		if (!available.length) {
			this.once('ready', function () {
				var consumer = available.shift();
				//console.log('FAN ATTACHED writing chunk ' + chunk);
				consumer.write(chunk, function (err) {
					available.push(consumer);
					me.emit('ready');
				});
				callback();
			});
		} else {
			//console.log('FAN writing chunk ' + chunk);
			var consumer = available.shift();
			consumer.write(chunk, function (err) {
				available.push(consumer);
				me.emit('ready');
			});
			callback();
		}
	};

	this.pipe = function (dest, opts) {
		return out.pipe.apply(out, arguments);
	};

	this.on('finish', function () {
		for (var consumer of consumers) {
			consumer.end();
		}
	});

	out.on('end', () => {
		this.emit('end');
	});

};
util.inherits(Parallelizer, stream.Transform);

module.exports = Parallelizer;
