var http = require('http');
var fs = require('fs');

var server = http.createServer(function (req, res) {
    /* Log every request */
    console.log('[' + new Date() + '] ' + req.url);

    var filename = '.' + req.url;
    try {
        var stat = fs.statSync(filename);
        if (stat.isFile()) {
            /* Send file if it exists */
            fs.readFile(filename, function (err, data) {
                if (err) {
                    console.log('error reading file "' + filename + '": ' + err);
                    res.writeHead(500);
                    res.end();
                } else {
                    res.end(data);
                }
            });
        } else if (stat.isDirectory()) {
            /* List dir contents if it exists */
            fs.readdir(filename, function (err, data) {
                if (err) {
                    console.log('error reading dir "' + filename + '": ' + err);
                    res.writeHead(500);
                    res.end();
                } else {
                    res.write('<html><head><title>Listing for ' + filename + '</title></head><body><h1>Listing for <pre>' + filename + '</pre></h1>');
                    data.forEach(function (item) {
                        res.write('<pre><a href="' + req.url + (req.url[req.url.length - 1] === '/' ? '' : '/') + item + '">' + item + '</a></pre>');
                    });
                    res.end('</body></html>');
                }
            });
        } else {
            console.log('other');
            res.writeHead(403);
            res.end();
        }
    } catch (e) {
        console.log('returning 404:', e.message);
        res.writeHead(404);
        res.end('File not found! ' + filename);
    }

});

var port = parseInt(process.argv[2], 10) || 9001;

server.listen(port, function () {
    console.log('Ready on port', port);
});
