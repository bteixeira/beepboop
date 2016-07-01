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
    connection.findUncuratedImage((err, image) => {
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


module.exports = router;
