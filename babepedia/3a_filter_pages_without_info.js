var stream = require('stream');

var DirFilesIterator = require('./__dir_files_iterator');
var LineOutputter = require('./__line_outputter');
var FileContentsReader = require('./__file_contents_reader');
var Cheerizer = require('./__cheerizer');


new DirFilesIterator('../data/babepedia/pages_raw')

//.pipe(new LineOutputter())


    .pipe(new FileContentsReader())
    .pipe(new Cheerizer())

    .pipe(new stream.Transform({
        objectMode: true,
        transform: function ($, encoding, callback) {
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
                var $label = $li.find('label');
                var label = $label.text();
                var value = $li.text().slice(label.length).trim();
                label = label.match(/(.+)\:?$/)[1];
                model[label] = value;
            });
            if ('Bra/cup size' in model) {
                callback();
                return;
            }
            this.push(model);
            callback();
        }
    }))
    .pipe(process.stdout)
;