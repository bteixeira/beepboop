var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser');

var mmm = require('mmmagic');
var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

var utils = require('../utils');

var storage = require('../storage/diskdb');
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
    const CONVERSION = {
        horizontalAngle: {
            '1': 'full-frontal',
            '2': 'three-quarters',
            '3': 'side',
            '4': 'reverse-three-quarters',
            '5': 'back'
        },
        exposure: {
            '0': 'not in the picture (body not shown)',
            '1': 'completely covered, curve barely visible',
            '2': 'completely covered but prominent curve',
            '3': 'bra or bikini',
            '4': 'hand-bra or other minor cover', // the model is not dressed anymore
            '5': 'full disclosure'
        }
    };
    for (var p in req.query) {
        console.log('checking', p);
        console.log('checking', req.query[p]);
        if (p in CONVERSION && req.query[p] in CONVERSION[p]) {
            query[p] = CONVERSION[p][req.query[p]];
        } else {
            console.log('nope');
        }
    }

    console.log('processed parameters', query);


    connection.getRandomCroppedImage(query, img => {
        console.log('got bytes', img.cropped.length);
        res.end(img.cropped);
    });
});


module.exports = router;
