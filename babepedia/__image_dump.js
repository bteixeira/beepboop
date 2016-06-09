//var crypto = require('crypto');
//var fs = require('fs');
//var stream = require('stream');
//var util = require('util');
//
//var utils = require('../utils');
//
//function ImageDump(/*prefix, suffix*/) {
//    stream.Transform.call(this, {objectMode: true});
//    //this._prefix = prefix;
//    //this._suffix = suffix;
//}
//util.inherits(ImageDump, stream.Transform);
//
//ImageDump.prototype._transform = function (img, encoding, callback) {
//    //var filename =
//    //    this._prefix +
//    //    page.url
//    //        .replace(/^https?\:\/\//g, '')
//    //        .replace(/[ \.\:-]+/g, '_')
//    //        .replace(/\//g, '___') +
//    //    this._suffix;
//    //console.log(`Writing to ${filename}...`);
//    //var contents = JSON.stringify(page);
//    //utils.justWrite(filename, contents, function (err) {
//    //    callback(err);
//    //    console.log('done!');
//    //});
//
//    var sha256 = crypto.createHash('sha256');
//
//    sha256.update(img.content);
//    var digest = sha256.digest(); // byte buffer
//
//    img.hash = digest.toString('base64');
//
//
//    //console.log(`File hash is ${digest.toString('base64')}`);
//    //console.log(`File hash is ${digest.toString('hex')}`);
//    //console.log(`File hash is ${sha256.digest('hex')}`);
//    //console.log(`File hash is ${sha256.digest('binary')}`);
//
//    img.deleted = false;
//
//
//    callback();
//
//
//
//};
//
//module.exports = ImageDump;
