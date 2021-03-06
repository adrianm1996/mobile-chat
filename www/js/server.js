

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
    cookieParser = require("cookie-parser"),
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
var useremail;
users = [];
connections = [];
toSend = [];

app.use(session);
app.use(bodyParser.json());
app.use(urlencodedParser);
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: './www' });
});

io.use(sharedsession(session, { autoSave: true }));
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
                            if (result == null)
                                socket.emit('er', {
                                    error: "Użytkownik o takim adresie e-mail nie istnieje, zarejestruj się."
                                });

                            else
                                bcrypt.compare(usrLog.password, result.passwd, function (errors, result2) {
                                    if (result2) {

                                        var destination = './registration.html';
                                        loggedUsr = result.user;
                                        socket.emit('redirect', destination);
                                        direct = true;
                                    }
                                    else
                                        socket.emit('er', {
                                            error: "Błędny login lub hasło"
                                        });
                                });

                        });
                    }
                });

                socket.emit('loggedUser', {
                    login: loggedUsr
                });


            });


            io.of('/registration.html').on('connection', function (socket) {


                connections.push(socket);
                console.log("Connected: %s sockets connected", connections.length);

                socket.on('login', function (userdata) {
                    socket.username = userdata.login;
                    users.push(socket.username);
                });



                socket.on('logout', function (userdata) {
                    users.splice(users.indexOf(socket.username), 1);
                    connections.splice(connections.indexOf(socket), 1);
                    console.log("Disconnected: %s sockets connected", connections.length);

                });


                socket.on('createChat', function (usr) {
                    //db.getMongo().getDBNames().indexOf("mydb");
                    var userName = usr.withUserName;
                    var userSurname = usr.withUserSurname;

                    var findEmail = db.db().collection('users');
                    findEmail.findOne({ name: userName, surname: userSurname }, function (err, result) {
                        if (result == null) console.log("login invalid");
                        else if (result.name == userName && result.surname == userSurname) {
                            useremail = result.user;
                            socket.emit("clickedUser", {
                                clickuser: useremail
                            });
                            dbName1 = usr.loggedUser + '&' + useremail + 'CHAT';
                            dbName2 = useremail + '&' + usr.loggedUser + 'CHAT';
                            dbName = useremail + '&' + usr.loggedUser + 'CHAT';
                            var newDB = db.db();
                            newDB.listCollections().toArray((error, collections) => {
                                if (collections.find(x => x.name === dbName1)) {
                                    dbName = dbName1;
                                    userChat = db.db().collection(dbName);
                                }

                                if (collections.find(x => x.name === dbName2)) {

                                    dbName = dbName2;
                                    userChat = db.db().collection(dbName);
                                }


                                userChat = db.db().collection(dbName);
                                socket.second = useremail;
                                socket.selected = userChat;
                                userChat.find().toArray(function (err, res) {
                                    if (err)
                                        console.log(err);
                                    else {
                                        socket.emit('output', res);
                                    }
                                });
                            });
                        }
                        else
                            console.log("user not found");
                    });
                });

                socket.on('message', function (msg) {
                    var loginUser = socket.username;
                    var selectUser = socket.second;
                    var whitespacepattern = /^\s*$/;
                    if (whitespacepattern.test(msg.message)) {
                        socket.emit('er', "wiadomość nie może być pusta.");
                    }
                    else {
                        var name, name2;
                        var surname, surname2;
                        var username1 = 'test', username2 = 'test';

                        socket.selected.insert({ username: msg.username, message: msg.message })

                        var findEmail = db.db().collection('users');
                        findEmail.findOne({ user: selectUser }, function (err, result) {

                            name = result.name;
                            surname = result.surname;
       
                            username1 = name + ' ' + surname;
                            console.log(username1);
                            
                            io.of('registration.html').emit('message', {
                                message: msg.message,
                                username: msg.username,
                                userlogin: loginUser,
                                login: username1
                            });
                        });

                        var findEmailSecond = db.db().collection('users');
                        findEmailSecond.findOne({ user: loginUser }, function (err, result) {

                            name2 = result.name;
                            surname2 = result.surname;

                            username2 = name2 + ' ' + surname2;
                            console.log(username2);

                            io.of('registration.html').emit('message', {
                                message: msg.message,
                                username: msg.username,
                                userlogin: selectUser,
                                login: username2
                            });
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