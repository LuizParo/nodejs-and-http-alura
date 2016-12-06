module.exports = function(app) {
    app.get('/pagamentos', function(req, res) {
        res.send('OK');
    });

    app.post('/pagamentos', function(req, res) {
        req.assert('forma_de_pagamento', 'Forma de pagamento obrigatoria')
            .notEmpty();

        req.assert('valor', 'Valor obrigatorio e deve ser decimal')
            .notEmpty().isFloat();

        var erros = req.validationErrors();
        if(erros) {
            console.log('Erros de validação encontrados');
            res.status(400).send(erros);
            return;
        }

        var pagamento = req.body;
        pagamento.status = 'CRIADO';
        pagamento.data = new Date;

        var connection = app.persistencia.connectionFactory();
        var pagamentoDao = new app.persistencia.PagamentoDao(connection);

        console.log('iniciando persistencia do pagamento');

        pagamentoDao.salva(pagamento, function(error, resultado) {
            if(error) {
                console.log(error);
                res.status(500).json(error);
                return;
            }

            console.log('pagamento criado: ' + resultado);
            res.location('/pagamentos/' + resultado.insertId);
            res.status(201).json(pagamento);
        });
    });
};