var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');

var mmm = require('mmmagic');
var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

var utils = require('../utils');

const META = require('./public/meta.config.json');

var storage = require('../storage/default');
var connection;
storage.getConnection(null, (err, db) => {
    if (err) {
        throw err;
    }
    connection = db;
});

var router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.send('api okay');
});

router.get('/getImage', function (req, res) {
    console.log('ping');
    var skip = parseInt(req.query.skip, 10) || 0;
    console.log('skipping?', skip);
    connection.findUncuratedImage({}, skip, (err, image) => {
        console.log('found image');
        if (err) {
            throw err;
        }
        connection.getModel(image.source, image.slug, (err, model) => {
            console.log('found model');
            if (err) {
                throw err;
            }
            var filepath = utils.getFullSinglePath(image);
            fs.readFile(filepath, (err, data) => {
                if (err) {
                    throw err;
                }
                image.contents = data.toString('base64');
                magic.detect(data, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    image.mimeType = result;
                    console.log(model);
                    // console.log(image);
                    res.json({model: model, image: image});
                });

            });
        });
    });
});

router.post('/saveImage', function (req, res) {
    connection.addImageMetadata(req.body.hash, req.body.metadata, (err) => {
        if (err) {
            throw err;
        }
        res.end('ok');
    });
});

router.get('/getCroppedImage', function (req, res) {
    console.log('pang');

    var query = {};

    for (var p in req.query) {
        if (p in META) {
            META[p].values.forEach((value) => {
                var val = value;
                if ('value' in val) {
                    val = val.value;
                }
                if (req.query[p] === val) {
                    query[p] = val;
                }
            });
            if (!(p in query) && (!isNaN(parseInt(req.query[p], 10))) && req.query[p] < META[p].values.length) {
                query[p] = META[p].values[req.query[p]];
                if ('value' in query[p]) {
                    query[p] = query[p].value;
                }
            }
        }
    }

    connection.getRandomCroppedImage(query, (err, img) => {
        if (err) {
            res.status(500);
            res.end(err);
        } else {
            console.log('got bytes', img.cropped.length);
            res.end(img.cropped);
        }
    });
});


module.exports = router;
