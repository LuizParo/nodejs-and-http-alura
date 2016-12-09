module.exports = function(app) {
    var correiosSOAPClient = new app.clients.CorreiosSOAPClient(); 
    
    app.get('/correios/prazos', function(req, res) {
        var dadosEntrega = {
            nCdServico : req.query.nCdServico,
            sCepOrigem : req.query.sCepOrigem,
            sCepDestino : req.query.sCepDestino
        };

        console.log(dadosEntrega);

        correiosSOAPClient.calculaPrazo(dadosEntrega, function(erro, resultado) {
            if(erro) {
                console.log(erro);
                res.status(500).send(erro);
                return;
            }

            console.log(resultado);
            res.json(resultado);
        });
    });
};