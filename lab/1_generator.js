var util = require('util');
var stream = require('stream');

function Generator() {
    stream.Readable.call(this, {objectMode: true});
}
util.inherits(Generator, stream.Readable);
Generator.prototype._read = function (size) {
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(char => this.push(`http://www.babepedia.com/index/${char}`));
    this.push(null);
};

module.exports = Generator;
