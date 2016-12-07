module.exports = function(app) {
    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);
    var clienteCartoes = new app.clients.ClienteCartoes();

    app.get('/pagamentos', function(req, res) {
        res.send('OK');
    });

    app.post('/pagamentos', function(req, res) {
        req.assert('pagamento.forma_de_pagamento', 'Forma de pagamento obrigatoria')
            .notEmpty();

        req.assert('pagamento.valor', 'Valor obrigatorio e deve ser decimal')
            .notEmpty().isFloat();

        var erros = req.validationErrors();
        if(erros) {
            console.log('Erros de validação encontrados');
            res.status(400).send(erros);
            return;
        }

        var pagamento = req.body.pagamento;
        pagamento.status = 'CRIADO';
        pagamento.data = new Date;

        console.log('iniciando persistencia do pagamento');

        pagamentoDao.salva(pagamento, function(error, resultado) {
            if(error) {
                console.log(error);
                res.status(500).json(error);
                return;
            }

            if(pagamento.forma_de_pagamento == 'cartao') {
                var cartao = req.body.cartao;
                console.log(cartao);

                clienteCartoes.autoriza(cartao, function(error, request, response, retorno) {
                    if(error) {
                        res.status(500).json(error);
                    }

                    res.status(201).json(retorno);
                });
                return;
            }

            var response = {
                links : [{
                    href : '/pagamentos/' + resultado.insertId,
                    rel : 'buscar',
                    method : 'GET'
                }, {
                    href : '/pagamentos/' + resultado.insertId,
                    rel : 'confirmar',
                    method : 'PUT'
                }, {
                    href : '/pagamentos/' + resultado.insertId,
                    rel : 'cancelar',
                    method : 'DELETE'
                }]
            };

            console.log('pagamento criado: ' + resultado);
            res.location('/pagamentos/' + resultado.insertId);
            res.status(201).json(response);
        });
    });

    app.get('/pagamentos/:id', function(req, res) {
        pagamentoDao.buscaPorId(req.params.id, function(error, pagamento) {
            if(error) {
                console.log(error);
                res.status(500).json(error);
                return;
            }

            res.json(pagamento);
        });
    });

    app.put('/pagamentos/:id', function(req, res) {
        var pagamento = {
            id : req.params.id,
            status : 'CONFIRMADO'
        };

        pagamentoDao.atualizaStatus(pagamento, function(error, resultado) {
            if(error) {
                console.log(error);
                res.status(500).json(error);
                return;
            }

            res.status(200).json(pagamento);
        });
    });

    app.delete('/pagamentos/:id', function(req, res) {
        var pagamento = {
            id : req.params.id,
            status : 'CANCELADO'
        };

        pagamentoDao.atualizaStatus(pagamento, function(error, resultado) {
            if(error) {
                console.log(error);
                res.status(500).json(error);
                return;
            }

            res.sendStatus(204);
        });
    });
};