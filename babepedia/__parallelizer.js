var stream = require('stream');
var util = require('util');

var Paralelizer = function (count, Class) {
    stream.Transform.call(this, {objectMode: true});
    var consumers = [];

    if (typeof count === 'number') {
        for (var i = 0 ; i < count ; i++) {
            consumers.push(new Class());
        }
    } else {
        count.forEach(consumer => {
            consumers.push(consumer);
        });
    }

    var open = consumers.length;
    var out = new stream.PassThrough({objectMode: true});

    function closeConsumer () {
        open -= 1;
        if (open <= 0) {
            out.end();
        }
    }

    consumers.forEach(consumer => {
        consumer.pipe(out, {end: false});
        consumer.on('end', closeConsumer);
    });

    var me = this;

    this._transform = function (chunk, encoding, callback) {
        //console.log('FAN received chunk ' + chunk);
        if (!consumers.length) {
            this.once('ready', function () {
                var consumer = consumers.shift();
                //console.log('FAN ATTACHED writing chunk ' + chunk);
                consumer.write(chunk, function (err) {
                    consumers.push(consumer);
                    me.emit('ready');
                });
                callback();
            });
        } else {
            //console.log('FAN writing chunk ' + chunk);
            var consumer = consumers.shift();
            consumer.write(chunk, function (err) {
                consumers.push(consumer);
                me.emit('ready');
            });
            callback();
        }
    };

    this.pipe = function (dest, opts) {
        return out.pipe.apply(out, arguments);
    };

};
util.inherits(Paralelizer, stream.Transform);

module.exports = Paralelizer;
