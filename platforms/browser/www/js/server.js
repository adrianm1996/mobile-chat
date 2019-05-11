
//var express = require('express'),
//    app = express(),
//    server = require('http').createServer(),
//    io = require('socket.io').listen(80),
//    mongo = require('mongodb').MongoClient;
//var io = require('socket.io').listen(80);

//server.listen(process.env.PORT || 8080);

//var server = app.listen(3000, '::1', function () {
//    var host = server.address().address;
//    var port = server.address().port;
//    console.log('running at http://' + host + ':' + port)
//});

// ----------------------------------------------------------------version no.1 THE BEST

//var express = require('express'),
//    app = express(),
//    http = require('http').createServer(app),
//    connect = require('connect'),
//    io = require('socket.io')(http),
//    mongo = require('mongodb').MongoClient;


//app.get('/', function (req, res) {

//    res.sendFile('registration.html', { root: '../../www' });
//});

//http.listen(process.env.PORT || 3000, '192.168.0.105', function () {
//    var host = http.address().address;
//     var port = http.address().port;
//     console.log('running at http://' + host + ':' + port)
//    //console.log('listening on *:  ');
//});
//app.use(express.static('public'));

// ----------------------------------------------------------------version no.2 heroku version

var express = require('express'),
    app = express(),
    http = require('http').createServer(app),
    connect = require('connect'),
    io = require('socket.io')(http),
    mongo = require('mongodb').MongoClient;


app.get('/', function (req, res) {

    res.sendFile('index.html', { root: './www' });
    //res.sendFile('messages.js');
});

http.listen(process.env.PORT || 3000, function () {
    var host = http.address().address;
    var port = http.address().port;
    console.log('open at http://' + host + ':' + port)
    //console.log('listening on *:  ');
});
app.use(express.static('public'));

mongo.connect('mongodb+srv://admis:Turing123@cluster0-xts4d.mongodb.net/mobile-app',{ useNewUrlParser: true }, function (err, db) {
        if (err) {

            console.log(err);
        }
        else {
            io.sockets.on('connection', function (socket) {
                console.log("Socket connected.");


                var users = db.db().collection('users');
                users.find().toArray(function (err, res) {
                    if (err)
                        console.log(err);
                    else
                        socket.emit('output', res);
                });
                socket.on('user', function (usr) {
                    var whiteSpacePattern = /^\s*$/;
                    if (whiteSpacePattern.test(usr.email) || whiteSpacePattern.test(usr.password)) {
                        socket.emit('er', "Wpisz cos.");
                    }
                    else {
                        users.insert({ user: usr.email, passwd: usr.password })
                        io.emit('user', {
                            user: usr.email,
                            passwd: usr.password
                        });
                    }
                });

                socket.on('userLogin', function (usrLog) {
                    var whiteSpacePattern = /^\s*$/;
                    if (whiteSpacePattern.test(usrLog.email) || whiteSpacePattern.test(usrLog.password)) {
                        socket.emit('er', "Wpisz cos.");
                    }
                    else {
                        app.get('/', function (req, res) {
                            users.findOne({ user: usrLog.email }, function (err, result) {
                                if (result == null) console.log("login invalid");
                                else if (result.user == usrLog.email && result.passwd == usrLog.password) {
                                    console.log("correct");
                                    //REDIRECT
                                    //var destination = './registration.html';
                                    //socket.emit('redirect', destination);
                                }
                                else
                                    console.log("user not found");
                            });

                        });


                    }

                    //app.post('/demo', urlencodedParser, function (req, res) {
                    //    MongoClient.connect(url, function (err, db) {
                    //        db.collection('userprofile').findOne({ name: req.body.name }, function (err, user) {
                    //            if (user === null) {
                    //                res.end("Login invalid");
                    //            } else if (user.name === req.body.name && user.pass === req.body.pass) {
                    //                res.render('completeprofile', { profileData: user });
                    //            } else {
                    //                console.log("Credentials wrong");
                    //                res.end("Login invalid");
                    //            }
                    //        });
                    //    });
                    //});


                    //REDIRECT

                    //console.log("redirect1");
                    //var destination = './www/registration.html';
                    //socket.emit('redirect', destination);

                    //var col = db.db().collection('messages');

                    //col.find().toArray(function (err, res) {
                    //    if (err)
                    //        console.log(err);
                    //    else
                    //        socket.emit('output', res);
                    //});
                    //socket.on('message', function (msg) {
                    //    var whiteSpacePattern = /^\s*$/;

                    //    if (whiteSpacePattern.test(msg.username) || whiteSpacePattern.test(msg.message)) {
                    //        socket.emit('er', "Wiadomo�� i nazwa u�ytkownika nie mo�e by� pusta.");
                    //    }
                    //    else {
                    //        col.insert({ username: msg.username, message: msg.message })
                    //        io.emit('message', {
                    //            message: msg.message,
                    //            username: msg.username
                    //        });
                    //    }
                    //});

                });

            });
        }
});