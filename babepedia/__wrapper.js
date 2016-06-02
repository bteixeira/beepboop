var stream = require('stream');
var util = require('util');

function Wrapper(fun) {
    stream.Transform.call(this, {objectMode: true});
    this._fun = fun;
}
util.inherits(Wrapper, stream.Transform);

Wrapper.prototype._transform = function (chunk, encoding, callback) {
    var result = this._fun(chunk);
    callback(null, result);
};

module.exports = Wrapper;
