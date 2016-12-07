var restify = require('restify');

function ClienteCartoes() {
    this._cliente = restify.createJsonClient({
        url : 'http://localhost:3001'
    });
}

ClienteCartoes.prototype.autoriza = function(cartao, callback) {
    this._cliente.post('/cartoes/autoriza', cartao, callback);
};

module.exports = function() {
    return ClienteCartoes;
};