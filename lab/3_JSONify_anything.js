var util = require('util');
var stream = require('stream');
var request = require('request');

function JSONifier(space) {
    stream.Transform.call(this, {objectMode: true});

    function stringify(val) {
        return JSON.stringify(val, null, space);
    }

    var first = true;
    var single = true;
    var cached;

    this._transform = function (val, encoding, callback) {
        if (first) {
            first = false;
            cached = val;
        } else {
            if (single) {
                single = false;
                this.push('[\n\n' + stringify(cached));
            }
            this.push(',\n' + stringify(val));
        }
        callback();
    };
    this._flush = function (callback) {
        if (!first) {
            if (single) {
                this.push(stringify(single));
            } else {
                this.push('\n\n]');
            }
        }
        callback();
    };
}
util.inherits(JSONifier, stream.Transform);

module.exports = JSONifier;
