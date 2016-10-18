var fs = require('fs');
var util = require('util');

var express = require('express');
var session = require('express-session');
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

router.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'CANJA-DE-GALINHA'
}));
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

router.get('/', function (req, res) {
    res.send('api okay');
});

/**
 * Returns the JSON of an uncurated image
 */
router.get('/getImage', function (req, res) {
    console.log('ping');
    var skip = parseInt(req.query.skip, 10) || 0;
    console.log('skipping?', skip);
    connection.findUncuratedImage({}, skip, (err, image) => {
        console.log('found image', image);
        if (err) {
            throw err;
        }
        if (!image) {
            res.end();
            return;
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

router.get('/getNextSet', function (req, res) {
    var size = req.query.size;
    if (typeof size === 'string') {
        size = parseInt(size, 10);
    }
    if (typeof size !== 'number' || isNaN(size)) {
        size = 5;
    }

    var query = {
        use: true,
        exposure: 'full-disclosure',
        qualityIssues: 'ok',
        horizontalAngle: ['full-frontal', 'three-quarters'],
        pushUp: false
    };

    connection.getRandomCuratedImages(query, size, (err, imgs) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            console.log('got images', imgs.length);

            var n = 0;
            var result = [];
            imgs.forEach(img => {
                utils.getCroppedContent(img, (err, contents) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send(err);
                        return;
                    }
                    magic.detect(contents, (err, mimeType) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send(err);
                            return;
                        }
                        result.push({
                            id: img._id,
                            contents: contents.toString('base64'),
                            mimeType: mimeType
                        });
                        n = n + 1;
                        if (n >= imgs.length) {
                            res.send(result);
                        }
                    });
                });
            });
        }
    });
});

router.post('/makeGuess', function (req, res) {
    // required: user handle, image id, guess
    console.log(`User Guessing ${util.inspect(req.body)}`);
    console.log(`User Session ${util.inspect(req.session)}`);
    var guess = req.body.guess;
    if (guess === 'real') {
        guess = 'Real/Natural';
    } else if (guess === 'fake') {
        guess = 'Fake/Enhanced';
    }

    connection.findImageById(req.body.id, (err, image) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
            return;
        }
        connection.findModelByImage(image, (err, model) => {
            if (err) {
                console.error(err);
                res.status(500).send(err);
                return;
            }
            var result = (guess === model.attributes.Boobs);
            if (result) {
                req.session.user.credits += 1;
            }
            res.send({
                correct: result,
                credits: req.session.user.credits
            });
        });
    });
});

/**
 * Deducts the price from the user's account.
 * Returns the JSON for the image and model.
 */
const IMAGE_PRICE = 10;
router.post('/buyImage', function (req, res) {
    console.log('session:', req.session);
    if (req.session.user.credits < IMAGE_PRICE) {
        res.send({error: true, message: 'Not enough credits'});
    } else {
        getImage(req.body.id, (err, image) => {
            if (err) {
                res.send(err);
            } else {
                connection.findModelByImage(image, (err, model) => {
                    if (err) {
                        res.send(err);
                    } else {
                        req.session.user.credits -= IMAGE_PRICE;
                        res.send({
                            image: image,
                            model: model,
                            credits: req.session.user.credits
                        });
                    }
                });
            }
        });
    }
});

function getImage(id, callback) {
    connection.findImageById(id, (err, image) => {
        if (err) {
            callback(err);
        }
        utils.getFullContent(image, (err, contents) => {
            if (err) {
                callback(err);
            }
            magic.detect(contents, (err, mimeType) => {
                if (err) {
                    callback(err);
                }
                image.contents = contents.toString('base64');
                image.mimeType = mimeType;
                callback(null, image);
            });
        });
    });
}

module.exports = router;
