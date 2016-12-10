var memcached = require('memcached');

function MemcachedClient() {
    this._cliente = new memcached('localhost:11211', {
        retries : 10,
        retry : 10000,
        remove : true
    });
};

MemcachedClient.prototype.guarda = function(pagamento, callback) {
    this._cliente.set('pagamento-' + pagamento.id, pagamento, 60000, callback);
};

MemcachedClient.prototype.busca = function(id, callback) {
    this._cliente.get('pagamento-' + id, callback);
};

/*function(erro, retorno) {
        if(erro || !retorno) {
            console.log('MISS - chave não encontrada');
        } else {
            console.log('HIT - valor: ' + JSON.stringify(retorno));
        }
    }*/

module.exports = function() {
    return MemcachedClient;
};