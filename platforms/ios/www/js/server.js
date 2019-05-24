

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
    JSDOM = jsdom.JSDOM;

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
                                loggedUsr = result.user;
                                socket.emit('redirect', destination);
                                direct = true;

                            }
                            else
                                console.log("user not found");
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
                            console.log("tst");
                            useremail = result.user;
                            console.log(useremail);
                            dbName1 = usr.loggedUser + '&' + useremail + 'CHAT';
                            dbName2 = useremail + '&' + usr.loggedUser + 'CHAT';
                            dbName = useremail + '&' + usr.loggedUser + 'CHAT';

                            var db1Chat = db.db().collection(dbName1);
                            var db2Chat = db.db().collection(dbName2);
                            console.log("DBCHAT1 : " + db1Chat);
                            console.log("DBCHAT2 : " + db2Chat);
                            if (db1Chat["name"] == dbName1)
                                console.log("TAK 1");
                            if (db2Chat["name"] == dbName2)
                                console.log("TAK 2");

                            //var databasa = db.db().listCollections().toArray();
                            //if (dbName1 in databasa) {
                            //    console.log(dbName1)
                            //}
                            //if (dbName2 in databasa) {
                            //    console.log(dbName2)
                            //}
                            var newDB = db.db();
                            newDB.collections(function (err, collectionList) {
                                
                                console.log(collectionList);
                                console.log("-----------------------------------------------");
                                console.log("NAME : " + collectionList["name"]);
                                console.log("NAME2 : " + collectionList[1]["name"]);
                                console.log("NAME3 : " + collectionList["s"]);
                                console.log("NAME4 : " + collectionList.find({}, { name: dbName }));

                                if (collectionList["name"] == dbName1)
                                    console.log("TAK 1");
                                if (collectionList["name"] == dbName2)
                                    console.log("TAK 2");


                                var keys = [];
                                collectionList.find().forEach(function (doc) {
                                    for (var key in doc) {
                                        if (keys.indexOf(key) < 0) {
                                            keys.push(key);
                                        }
                                    }
                                });
                            });

                            
                            

                            //newDB.listCollections().toArray((error, collections) => {
                            //    console.log('error: ', err);
                            //    console.log('collections: ', collections);
                            //    console.log("-----------------------------------------------");
                            //    if (collections["name"] == dbName1)
                            //        console.log("TAK 1");
                            //    if (collections["name"] == dbName2)
                            //        console.log("TAK 2");

                            //})

                           

                            userChat = db.db().collection(dbName);
                            
                            userChat.find().toArray(function (err, res) {
                                if (err)
                                    console.log(err);
                                else {
                                    socket.emit('output', res);
                                }
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