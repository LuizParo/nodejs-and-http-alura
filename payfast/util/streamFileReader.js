var fs = require('fs');

fs.createReadStream('arquivo.jpg')
    .pipe(fs.createWriteStream('arquivo-com-stream.jpg'))
    .on('finish', function() {
        console.log('arquivo escrito com stream');
    });