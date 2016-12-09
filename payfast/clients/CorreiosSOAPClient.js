var soap = require('soap');

function CorreiosSOAPClient() {
    this._url = 'http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx?wsdl';
};

CorreiosSOAPClient.prototype.calculaPrazo = function(dadosEntrega, callback) {
    soap.createClient(this._url, function(error, client) {
        if(error) {
            console.log(error);
            return;
        }

        client.CalcPrazo(dadosEntrega, callback);
    });
};

module.exports = function() {
    return CorreiosSOAPClient;
};