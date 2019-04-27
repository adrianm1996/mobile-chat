//var phonegap = require('connect-phonegap'),
//    express = require('express'),
//    path = require('path'),
//    app = express(),
//    http = require('http'),
//    mongo = require('mongodb').MongoClient;
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    //io = require('socket.io').listen(server),
    mongo = require('mongodb').MongoClient;

server.listen(process.env.PORT || 3000);

// var server = app.listen(process.env.PORT ||3000, '::1', function () {
//     var host = server.address().address;
//     var port = server.address().port;
//     console.log('running at http://' + host + ':' + port)
// });
var io = require('socket.io').listen(server);

app.get('/', function (req, res) {

    res.sendFile('index.html', { root: './www' });
});

mongo.connect('mongodb+srv://admis:Turing123@cluster0-xts4d.mongodb.net/mobile-app?retryWrites=true', { useNewUrlParser: true }, function (err, db) {
//mongo.connect('mongodb://127.0.0.1/test', { useNewUrlParser: true }, function (err, db) {
    if (err)
        console.log(err);
    else
        io.sockets.on('connection', function (socket) {
            console.log("Socket connected.");

     
            //var col = db.db().collection('messages');
            var col = db.collection('messages');

            col.find().toArray(function (err, res) {
                if (err)
                    console.log(err);
                else
                    socket.emit('output', res);
            });
            socket.on('message', function (msg) {
                var whiteSpacePattern = /^\s*$/;
            
                if (whiteSpacePattern.test(msg.username) || whiteSpacePattern.test(msg.message)) {
                    socket.emit('er', "Wiadomo�� i nazwa u�ytkownika nie mo�e by� pusta.");
                }
                else {
                    col.insert({ username: msg.username, message: msg.message })
                    io.emit('message', {
                        message: msg.message,
                        username: msg.username
                    });
                }
            });

        });

});