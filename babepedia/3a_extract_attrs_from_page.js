var stream = require('stream');

var cheerio = require('cheerio');

var DirFilesIterator = require('./__dir_files_iterator');
var FileContentsReader = require('./__file_contents_reader');
var Wrapper = require('./__wrapper');
var FilterModelsWithoutInfo = require('./__filter_models_without_info');
var FilterModelsWithoutPhotos = require('./__filter_models_without_photos');
var ModelFeeder = require('./_model_feeder');

new DirFilesIterator('../data/babepedia/pages_raw')
	.pipe(new FileContentsReader())
	.pipe(new Wrapper(JSON.parse))
	.pipe(new FilterModelsWithoutInfo())
	.pipe(new FilterModelsWithoutPhotos())
	.pipe(new stream.Transform({
		objectMode: true,
		transform: function (page, encoding, callback) {

			var html = page.doc;
			var $ = cheerio.load(html);

			var model = {};
			model.source = 'babepedia';
			model.slug = page.url.slice(page.url.lastIndexOf('/') + 1).replace(/\.html$/, '');
			model.attributes = {};
			model.name = model.attributes.name = $('#bioarea h1').text();
			$('#bioarea ul li').each((i, li) => {
				var $li = $(li);
				var $label = $li.find('.label');
				var label = $label.text();
				var value = $li.text().slice(label.length).trim();
				var match = label.match(/(.+?)\:?$/);
				if (match) {
					label = match[1];
					model.attributes[label] = value;
				}
			});
			console.log('Adding model! ' + page.url);
			this.push(model);
			callback();
		}
	}))
	.pipe(new ModelFeeder())
;
