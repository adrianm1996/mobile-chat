

var express = require('express'),
    session = require('express-session')({
        secret: 'my-secret',
        saveUninitialized: true,
        resave: true
    }),
    app = express(),
    http = require('http').createServer(app),
    io = require('socket.io')(http),
    sharedsession = require("express-socket.io-session"),
    bodyParser = require('body-parser'),
    urlencodedParser = bodyParser.urlencoded({ extended: true }),
    mongo = require('mongodb').MongoClient,
    jsdom = require('jsdom'),
    JSDOM = jsdom.JSDOM,
    bcrypt = require('bcrypt-nodejs');

GLOBAL.document = new JSDOM('./registration.html').window.document;
GLOBAL.window = new JSDOM('./registration.html').window;
var direct = false;
var loggedUsr = "loggedUser";
var $ = require('jquery');
var sess;
var userChat;
var dbName1, dbName2, dbName;


app.use(session);
app.use(bodyParser.json());
app.use(urlencodedParser);
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: './www' });
});

io.use(sharedsession(session));
mongo.connect('mongodb+srv://admis:Turing123@cluster0-xts4d.mongodb.net/mobile-app',
    { useNewUrlParser: true },
    function (err, db) {
        if (err) {

            console.log(err);
        }
        else {



            io.of('/').on('connection', function (socket) {
                console.log("Socket connected.");



                var users = db.db().collection('users');
                socket.on('user', function (usr) {
                    var whiteSpacePattern = /^\s*$/;
                    if (whiteSpacePattern.test(usr.email) || whiteSpacePattern.test(usr.password)) {
                        socket.emit('er', "Wpisz cos.");
                    }
                    else {


                        var hashPassword = usr.password;
                        bcrypt.genSalt(12, function (err, salt) {
                            if (err) throw err;
                            bcrypt.hash(hashPassword, salt, null, function (erro, hash) {
                                if (erro) throw erro;
                                hashPassword = hash;

                                users.insert({
                                    user: usr.email,
                                    passwd: hashPassword,
                                    name: usr.name,
                                    surname: usr.surname
                                });

                            });
                        });

                        //users.insert({
                        //    user: usr.email,
                        //    passwd: usr.password,
                        //    name: usr.name,
                        //    surname: usr.surname
                        //});
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

                            else
                                bcrypt.compare(usrLog.password, result.passwd, function (errors, result2) {
                                    if (result2) {
                                        var destination = './registration.html';
                                        loggedUsr = result.user;
                                        socket.emit('redirect', destination);
                                        direct = true;
                                    }
                                    else
                                        console.log("user not found");
                                });

                        });
                    }
                });
            });


            io.of('/registration.html').on('connection', function (socket) {
                console.log("messages connect");


                io.of('registration.html').emit('userLogin', {

                    email: loggedUsr
                });



                socket.on('createChat', function (usr) {
                    //db.getMongo().getDBNames().indexOf("mydb");
                    var userName = usr.withUserName;
                    var userSurname = usr.withUserSurname;
                    var useremail;
                    console.log(userName);
                    console.log(userSurname);
                    var findEmail = db.db().collection('users');
                    findEmail.findOne({ name: userName, surname: userSurname }, function (err, result) {
                        if (result == null) console.log("login invalid");
                        else if (result.name == userName && result.surname == userSurname) {
                            useremail = result.user;
                            console.log(useremail);
                            dbName1 = usr.loggedUser + '&' + useremail + 'CHAT';
                            dbName2 = useremail + '&' + usr.loggedUser + 'CHAT';
                            dbName = useremail + '&' + usr.loggedUser + 'CHAT';

                            var newDB = db.db();
                            newDB.listCollections().toArray((error, collections) => {
                                if (collections.find(x => x.name === dbName1)) {
                                    console.log(collections.find(x => x.name === dbName1).name);
                                    dbName = dbName1;
                                    userChat = db.db().collection(dbName);
                                }
                                else
                                    console.error('brak 1');
                                if (collections.find(x => x.name === dbName2)) {
                                    console.log(collections.find(x => x.name === dbName2).name)
                                    dbName = dbName2;
                                    userChat = db.db().collection(dbName);
                                }
                                else
                                    console.error('brak 2');

                                userChat = db.db().collection(dbName);

                                userChat.find().toArray(function (err, res) {
                                    if (err)
                                        console.log(err);
                                    else {

                                        socket.emit('output', result);


                                    }
                                });

                            });


                        }
                        else
                            console.log("user not found");
                    });


                });

                socket.on('message', function (msg) {
                    var whitespacepattern = /^\s*$/;

                    if (whitespacepattern.test(msg.message)) {
                        socket.emit('er', "wiadomość nie może być pusta.");
                    }
                    else {
                        userChat.insert({ username: msg.username, message: msg.message })

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
                        var tmpPerson = $('#email').text();
                        var person = $('#logged').text(tmpPerson);
                        socket.emit('peopleOutput', res);
                    }
                });


            });
        }
    });



http.listen(process.env.PORT || 3000, function () {
    var host = http.address().address;
    var port = http.address().port;
    console.log('open at http://' + host + ':' + port)
});