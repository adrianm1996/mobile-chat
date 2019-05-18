

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    connect = require('connect'),
    io = require('socket.io')(http),
    bodyParser = require('body-parser'),
    urlencodedParser = bodyParser.urlencoded({ extended: false }),
    mongo = require('mongodb').MongoClient,
    jsdom = require('jsdom'),
    JSDOM = jsdom.JSDOM;

GLOBAL.document = new JSDOM('./registration.html').window.document;
GLOBAL.window = new JSDOM('./registration.html').window;
var direct = false;
var loggedUsr;
var $ = require('jquery');

http.listen(process.env.PORT || 3000, function () {
    var host = http.address().address;
    var port = http.address().port;
    console.log('open at http://' + host + ':' + port)
});

app.use(express.static('public'));


mongo.connect('mongodb+srv://admis:Turing123@cluster0-xts4d.mongodb.net/mobile-app',
    { useNewUrlParser: true },
    function (err, db) {
        if (err) {

            console.log(err);
        }
        else {

            app.get('/', function (req, res) {
                res.sendFile('index.html', { root: './www' });
            });

            io.of('/').on('connection', function (socket) {
                console.log("Socket connected.");



                var users = db.db().collection('users');
                socket.on('user', function (usr) {
                    var whiteSpacePattern = /^\s*$/;
                    if (whiteSpacePattern.test(usr.email) || whiteSpacePattern.test(usr.password)) {
                        socket.emit('er', "Wpisz cos.");
                    }
                    else {
                        users.insert({
                            user: usr.email,
                            passwd: usr.password,
                            name: usr.name,
                            surname: usr.surname
                        });
                        io.emit('user', {
                            user: usr.email,
                            passwd: usr.password,
                            name: usr.name,
                            surname: usr.surname
                        });
                    }
                });

                socket.on('userLogin', function (usrLog) {
                    var whiteSpacePattern = /^\s*$/;
                    if (whiteSpacePattern.test(usrLog.email) || whiteSpacePattern.test(usrLog.password)) {
                        socket.emit('er', "Wpisz cos.");
                    }
                    else {

                        users.findOne({ user: usrLog.email }, function (err, result) {
                            if (result == null) console.log("login invalid");
                            else if (result.user == usrLog.email && result.passwd == usrLog.password) {
                                var destination = './registration.html';
                                socket.emit('redirect', destination);
                                direct = true;
                                loggedUsr = result.email;
                            }
                            else
                                console.log("user not found");
                        });
                    }
                });
            });

            app.get('/', function (req, res) {
                res.sendFile('registration.html', { root: './www' });
            });


            io.of('/registration.html').on('connection', function (socket) {
                console.log("messages connect");

                var col = db.db().collection('messages');
                col.find().toArray(function (err, res) {
                    if (err)
                        console.log(err);
                    else {
                        console.log('output');
                        socket.emit('output', res);

                    }

                });
                socket.on('message', function (msg) {
                    var whitespacepattern = /^\s*$/;

                    if (whitespacepattern.test(msg.username) || whitespacepattern.test(msg.message)) {
                        socket.emit('er', "wiadomość i nazwa użytkownika nie może być pusta.");
                    }
                    else {
                        col.insert({ username: msg.username, message: msg.message })
                        io.of('registration.html').emit('message', {

                            message: msg.message,
                            username: msg.username
                        });
                    }

                });


                var regUser = db.db().collection('users');
                regUser.find().toArray(function (err, res) {
                    if (err)
                        console.log(err);
                    else {
                        var tmpPerson = $('#email').value();
                        var person = $('#logged').text(tmpPerson);
                        socket.emit('peopleOutput', res);
                    }
                });


            });
        }
    });



