
const server = require('server');

mongo.connect('mongodb+srv://admis:Turing123@cluster0-xts4d.mongodb.net/mobile-app',
    { useNewUrlParser: true },
    function (err, db) {
    //mongo.connect('mongodb://127.0.0.1/test', { useNewUrlParser: true }, function (err, db) {
    
    if (err) {

        console.log(err);
    }
    else {
        io.sockets.on('connection', function (socket) {
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
                    io.emit('message', {
                        message: msg.message,
                        username: msg.username
                    });
                }
            });

        });
    }

});