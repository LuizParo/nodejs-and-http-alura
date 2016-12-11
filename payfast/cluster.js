var cluster = require('cluster');
var os = require('os');

var cpus = os.cpus();

console.log('executando thread');
if(cluster.isMaster) {
    console.log('executando thread master');

    cpus.forEach(function() {
        cluster.fork();
    });

    cluster.on('listening', worker => console.log('cluster conectado na porta %d', worker.process.pid));

    cluster.on('exit', worker => {
        console.log('cluster da porta %d desconectado', worker.process.pid);
        cluster.fork();
    });
} else {
    console.log('executando thread slave');
    require('./index.js');
}