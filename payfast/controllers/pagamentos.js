module.exports = function(app) {
    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);
    var clienteCartoes = new app.clients.ClienteCartoes();
    var memcached = new app.clients.MemcachedClient();

    app.get('/pagamentos', function(req, res) {
        pagamentoDao.lista(function(error, pagamentos) {
            if(error) {
                console.log(error);
                res.status(500).json(error);
                return;
            }

            var response = {
                links : []
            };

            pagamentos.forEach(function(pagamento) {
                response.links.push({
                    href : '/pagamentos/' + pagamento.id,
                    rel : 'buscar',
                    method : 'GET'
                });
            });

            res.json(response);
        });
    });

    app.get('/pagamentos/:id', function(req, res) {
        var id = req.params.id;

        memcached.busca(id, function(error, retorno) {
            if(error || !retorno) {
                console.log('MISS - chave não encontrada');

                pagamentoDao.buscaPorId(id, function(error, pagamentos) {
                    if(error) {
                        console.log(error);
                        res.status(500).json(error);
                        return;
                    }

                    var pagamento = pagamentos[0];
                    if(!pagamento) {
                        console.log('pagamento com id ' + req.params.id + ' não encontrado');
                        res.sendStatus(404);
                        return;
                    }

                    memcached.guarda(pagamento, function(erro) {
                        if(erro) {
                            console.log(erro);
                            res.status(500).json(erro);
                            return;
                        }

                        console.log('pagamento guardado no cache: ' + JSON.stringify(pagamento));
                        res.json(pagamento);
                    });
                });
            } else {
                console.log('HIT - valor: ' + JSON.stringify(retorno));
                console.log('pagamento encontrado');
                res.json(retorno);
            }
        });
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
                        console.log(error);
                        res.status(400).json(error);
                        return;
                    }

                    res.status(201).json(retorno);
                });
                return;
            }

            memcached.guarda(pagamento, function(erro) {
                if(erro) {
                    console.log(erro);
                    res.status(500).json(erro);
                    return;
                }

                console.log('pagamento guardado no cache: ' + JSON.stringify(pagamento));
                res.json(pagamento);
            });

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

            memcached.guarda(pagamento, function(erro) {
                if(erro) {
                    console.log(erro);
                    res.status(500).json(erro);
                    return;
                }

                console.log('pagamento guardado no cache: ' + JSON.stringify(pagamento));
                res.json(pagamento);
            });
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

            memcached.guarda(pagamento, function(erro) {
                if(erro) {
                    console.log(erro);
                    res.status(500).json(erro);
                    return;
                }

                console.log('pagamento guardado no cache: ' + JSON.stringify(pagamento));
                res.sendStatus(204);
            });
        });
    });
};