var stream = require('stream');

var cheerio = require('cheerio');

var DirFilesIterator = require('./__dir_files_iterator');
var LineOutputter = require('./__line_outputter');
var FileContentsReader = require('./__file_contents_reader');
var Wrapper = require('./__wrapper');
var ModelFeeder = require('./_model_feeder');


new DirFilesIterator('../data/babepedia/pages_raw')

    .pipe(new FileContentsReader())

    .pipe(new Wrapper(JSON.parse))

    .pipe(new stream.Transform({
        objectMode: true,
        transform: function (page, encoding, callback) {

            var html = page.doc;
            var $ = cheerio.load(html);

            var $thumbshots = $('#content .separate .thumbshot');
            var $thumbnails = $('#content .separate .thumbnail');
            if (!$thumbshots.length && !$thumbnails.length) {
                callback();
                return;
            }
            var model = {};
            model.name = $('#bioarea h1').text();
            $('#bioarea ul li').each((i, li) => {
                var $li = $(li);
                var $label = $li.find('.label');
                var label = $label.text();
                var value = $li.text().slice(label.length).trim();
                var match = label.match(/(.+?)\:?$/);
                if (match) {
                    label = match[1];
                    model[label] = value;
                }
            });
            if (!('Bra/cup size' in model)) {
                callback();
                return;
            }
            this.push(model);
            callback();
        }
    }))
    .pipe(feeder = new ModelFeeder())
;
