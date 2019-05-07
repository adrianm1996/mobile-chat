﻿
const server = require('server');

server.app.get('/', function (req, res) {

    res.sendFile('index.html', { root: './www' });
});


server.mongo.connect('mongodb+srv://admis:Turing123@cluster0-xts4d.mongodb.net/mobile-app',
    { useNewUrlParser: true },
    function (err, db) {
    
    if (err) {

        console.log(err);
    }
    else {
        server.io.sockets.on('connection', function (socket) {
            console.log("Socket connected.");

            var col = db.db().collection('messages');

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
                    server.io.emit('message', {
                        message: msg.message,
                        username: msg.username
                    });
                }
            });

        });
    }

});