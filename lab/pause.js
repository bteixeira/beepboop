var DFI = require('../babepedia/__dir_files_iterator');

var dfi = new DFI('../data/babepedia/pages_raw');

dfi.pipe(process.stdout);
dfi.pause();

setTimeout(() => {dfi.resume();}, 2000);
