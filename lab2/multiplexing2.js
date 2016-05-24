var util = require('util');
var stream = require('stream');





var GeneratorStream = function () {
    stream.Readable.call(this, {objectMode: true});
};
util.inherits(GeneratorStream, stream.Readable);
GeneratorStream.prototype._read = function (size) {
    for (var i = 0 ; i < 10 ; i++) {
        this.push(i);
    }
    this.push(null);
};




var CounterStream = function (name) {
    stream.Transform.call(this, {objectMode: true});
    this._name = name;
};
util.inherits(CounterStream, stream.Transform);
CounterStream.prototype._transform = function (chunk, encoding, callback) {
    console.log(this._name + ' receiving ' + chunk);
    this.push(chunk);
    callback();
};



var MergingStream = function () {
    stream.Writable.call(this, {objectMode: true});
};
util.inherits(MergingStream, stream.Writable);
MergingStream.prototype._write = function (chunk, encoding, callback) {
    console.log('Merger received: ' + chunk);
    callback();
};











var SlowStream = function () {
    stream.Writable.call(this, {objectMode: true});
};
util.inherits(SlowStream, stream.Writable);
SlowStream.prototype._write = function (chunk, encoding, callback) {
    console.log(`Received chunk ${chunk}, sleeping...`);
    setTimeout(function () {
        console.log('Done');
        callback();
    }, 2000);
};


var Paralelizer = function (consumers_) {
    stream.Transform.call(this, {objectMode: true});
    var consumers = [];
    var open = consumers_.length;
    var out = new stream.PassThrough({objectMode: true});

    function closeConsumer () {
        open -= 1;
        if (open <= 0) {
            out.end();
        }
    }

    consumers_.forEach(consumer => {
        consumers.push(consumer);
        //open.push(consumer);
        consumer.pipe(out, {end: false});
        consumer.on('end', closeConsumer);
    });
  //  var i = 0;
/*
    this.attach = function (consumer) {
        consumers.push(consumer);
        //this.emit('attached', consumer);
        this.emit('ready');
    };
*/
    //function sendToConsumer (chunk, consumer, callback) {
    //
    //}

    var me = this;

    this._transform = function (chunk, encoding, callback) {
        console.log('FAN received chunk ' + chunk);
        if (!consumers.length) {
            this.once('ready', function () {
                var consumer = consumers.shift();
                console.log('FAN ATTACHED writing chunk ' + chunk);
                consumer.write(chunk, function (err) {
                    consumers.push(consumer);
                    me.emit('ready');
                });
                callback();
            });
        } else {
            console.log('FAN writing chunk ' + chunk);
            var consumer = consumers.shift();
            //consumers[i].write(chunk);
            consumer.write(chunk, function (err) {
                consumers.push(consumer);
                me.emit('ready');
            });
            //i = (i + 1) % consumers.length;
            callback();
        }
    };

    this.pipe = function (dest, opts) {
        out.pipe.apply(out, arguments);
    };

};
util.inherits(Paralelizer, stream.Transform);



/*
 var generator = new GeneratorStream();
 generator.pipe(new SlowStream());
 */

/*
 var generator = new GeneratorStream();
 var fan = new Fan();
 generator.pipe(fan);
 fan.attach(new CounterStream('#1'));
 fan.attach(new CounterStream('#2'));
 */

/*
 var generator = new GeneratorStream();
 var fan = new Fan();
 generator.pipe(fan);
 setTimeout(function () {
 fan.attach(new SlowStream());
 fan.attach(new CounterStream('#1'));
 }, 2000);
 */


var Doubler = new stream.Transform({objectMode: true});
Doubler._transform = function (chunk, encoding, callback) {
    console.log('doubling...');
    this.push(chunk * 2);
    callback();
};


var Halver = new stream.Transform({objectMode: true});
Halver._transform = function (chunk, encoding, callback) {
    console.log('halving...');
    this.push(chunk / 2);
    callback();
};


new GeneratorStream()
    .pipe(new Paralelizer([
        Doubler,
        Halver
    ]))
    .pipe(new CounterStream('#1'));
