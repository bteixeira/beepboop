var cheerio = require('cheerio');

var Wrapper = require('./__wrapper');

module.exports = function () {
    return new Wrapper(function (page) {
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
        return model;
    });
};