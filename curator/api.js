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

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.send('api okay');
});

router.get('/getImage', function (req, res) {
    connection.findUncuratedImage((err, image) => {
        if (err) {
            throw err;
        }
        var filepath = utils.getFullSinglePath(image);
        fs.readFile(filepath, (err, data) => {
            if (err) {
                throw err;
            }
            image.contents = data.toString('base64');
            magic.detect(data, function(err, result) {
                if (err) {
                    throw err;
                }
                image.mimeType = result;
                console.log(image);
                res.json(image);
            });

        });
    });
});

router.post('/saveImage', function (req, res) {
    connection.addImageMetadata({
        hash: req.body.hash,
        metadata: req.body.metadata
    }, (err) => {
        if (err) {
            throw err;
        }
        res.end('ok');
    });
});


module.exports = router;
