/*
 * diskDB
 * http://arvindr21.github.io/diskDB
 *
 * Copyright (c) 2014 Arvind Ravulavaru
 * Licensed under the MIT license.
 */

/*jshint -W027*/
var fs = require('fs');
var merge = require('merge');
var util = {};

util.isValidPath = function(path) {
    return fs.existsSync(path);
};

util.writeToFile = function(outputFilename, content) {
    if (!content) {
        content = [];
    }
    fs.writeFileSync(outputFilename, JSON.stringify(content, null, 0));
};

util.readFromFile = function(file) {
    return fs.readFileSync(file, 'utf-8');
};

util.removeFile = function(file) {
    return fs.unlinkSync(file);
};

util.updateFiltered = function(collection, query, data, multi) {
    // break 2 loops at once - multi : false
    loop: for (var i = collection.length - 1; i >= 0; i--) {
        var c = collection[i];
        if (typeof query === 'function') {
            if (query(c)) {
                collection[i] = merge(c, data);
                if (!multi) {
                    break loop;
                }
            }
        } else {
            for (var p in query) {
                if (p in c && c[p] == query[p]) {
                    collection[i] = merge(c, data);
                    if (!multi) {
                        break loop;
                    }
                }
            }
        }
    }
    return collection;
};

// [TODO] : Performance
util.removeFiltered = function(collection, query, multi) {
    // break 2 loops at once -  multi : false
    loop: for (var i = collection.length - 1; i >= 0; i--) {
        var c = collection[i];
        if (typeof query === 'function') {
            if (query(c)) {
                collection.splice(i, 1);
                if (!multi) {
                    break loop;
                }
            }
        } else {
            for (var p in query) {
                if (p in c && c[p] == query[p]) {
                    collection.splice(i, 1);
                    if (!multi) {
                        break loop;
                    }
                }
            }
        }
    }
    return collection;
};

// [TODO] : Performance
util.finder = function(collection, query, multi) {
    var retCollection = [];
    loop: for (var i = collection.length - 1; i >= 0; i--) {
        var c = collection[i];
        if (typeof query === 'function') {
            if (query(c)) {
                retCollection.push(collection[i]);
                if (!multi) {
                    break loop;
                }
            }
        } else {
            for (var p in query) {
                if (p in c && c[p] == query[p]) {
                    retCollection.push(collection[i]);
                    if (!multi) {
                        break loop;
                    }
                }
            }
        }
    }
    return retCollection;
};

/** recursive finder **/
util.ObjectSearcher = function() {
    this.results = [];
    this.objects = [];
    this.resultIDS = {};
};

util.ObjectSearcher.prototype.findAllInObject = function(collection, query, isMulti) {
    for (var objKey in collection) {
        this.searchObject(collection[objKey], query, collection[objKey]);
        if (!isMulti && this.results.length == 1) {
            return this.results;
        }
    }

    while (this.objects.length !== 0) {
        var objRef = this.objects.pop();
        this.searchObject(objRef['_obj'], query, objRef['parent']);
        if (!isMulti && this.results.length == 1) {
            return this.results;
        }
    }

    return this.results;
};

util.ObjectSearcher.prototype.searchObject = function(object, query, opt_parentObj) {
    if (typeof query === 'function') {
        if (query(object)) {
            if (opt_parentObj !== undefined) {
                if (this.resultIDS[opt_parentObj['_id']] === undefined) {
                    this.results.push(opt_parentObj);
                    this.resultIDS[opt_parentObj['_id']] = '';
                }
            } else {
                if (this.resultIDS[object['_id']] === undefined) {
                    this.results.push(object);
                    this.resultIDS[object['_id']] = '';
                }
            }
        }
    } else {
        for (var objKey in object) {
            if (typeof object[objKey] != 'object') {
                if (query[objKey] == object[objKey]) {

                    if (opt_parentObj !== undefined) {
                        if (this.resultIDS[opt_parentObj['_id']] === undefined) {
                            this.results.push(opt_parentObj);
                            this.resultIDS[opt_parentObj['_id']] = '';
                        }
                    } else {
                        if (this.resultIDS[object['_id']] === undefined) {
                            this.results.push(object);
                            this.resultIDS[object['_id']] = '';
                        }
                    }
                }
            } else {
                var obj = object;
                if (opt_parentObj !== undefined) {
                    obj = opt_parentObj;
                }
                var objRef = {
                    parent: obj,
                    _obj: object[objKey]
                };

                this.objects.push(objRef);
            }
        }
    }
};

module.exports = util;
