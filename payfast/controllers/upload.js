var fs = require('fs');

module.exports = function(app) {

    // curl -v -X POST http://localhost:3000/imagens --data-binary @arquivo.jpg -H "Content-type: application/octet-stream" -H "filename: imagem.jpg"
    app.post('/imagens', function(req, res) {
        var filename = req.headers.filename;

        req.pipe(fs.createWriteStream('files/' + filename))
            .on('finish', function() {
                console.log('arquivo escrito');
                res.location('/imagens/' + filename);
                res.sendStatus(201);
            });
    });
};