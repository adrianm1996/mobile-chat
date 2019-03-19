var phonegap = require('connect-phonegap'),
    express = require('express'),
    path = require('path'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(process.env.PORT || 3000);


app.get('/', function (req, res) {
    
    res.sendFile(path.resolve('/PhoneGap - workspace/CHAT/www/index.html'));
});


io.sockets.on('connection', function (socket) {

    console.log("Socket connected.");

    socket.on('msg', function (message) {
        io.emit('msg', message);
    });

});