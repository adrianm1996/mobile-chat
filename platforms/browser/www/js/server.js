var phonegap = require('connect-phonegap'),
    express = require('express'),
    path = require('path'),
    app = express(),
    
    mongo = require('mongodb').MongoClient;

//server.listen(process.env.PORT || 3000);

var server = app.listen(3000, '::1', function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('running at http://' + host + ':' + port)
});
var io = require('socket.io').listen(server);

app.get('/', function (req, res) {

    res.sendFile('index.html', { root: '../../www' });
});

mongo.connect('mongodb://127.0.0.1/test', { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    console.log("test");
    io.sockets.on('connection', function (socket) {
        console.log("Socket connected.");

     
        var col = db.db().collection('messages');

        col.find().toArray(function (err, res) {
            if (err) throw err;
            socket.emit('output', res);
        });
        socket.on('message', function (msg) {
            var whiteSpacePattern = /^\s*$/;
            
            if (whiteSpacePattern.test(msg.username) || whiteSpacePattern.test(msg.message)) {
                socket.emit('er', "Wiadomoœæ i nazwa u¿ytkownika nie mo¿e byæ pusta.");
                console.log("error");
            }
            else {
                console.log("gut");
                col.insert({ username: msg.username, message: msg.message })
                io.emit('message', {
                    message: msg.message,
                    username: msg.username
                });
            }
        });

    });

});