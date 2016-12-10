var fs = require('fs');

fs.readFile('arquivo.jpg', function(error, buffer) {
    if(error) {
        console.log(error);
        return;
    }

    console.log('arquivo lido');
    fs.writeFile('novo-arquivo.jpg', buffer, function(error) {
        if(error) {
            console.log(error);
            return;
        }

        console.log('arquivo gravado');
    });
});