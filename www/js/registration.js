const server = require('server');

mongo.connect('mongodb+srv://admis:Turing123@cluster0-xts4d.mongodb.net/mobile-app',
    { useNewUrlParser: true },
    function (err, db) {

        if (err) {

            console.log(err);
        }
        else {
            io.sockets.on('connection', function (socket) {
                console.log("Socket connected.");

                var col = db.db().collection('users');

                col.find().toArray(function (err, res) {
                    if (err)
                        console.log(err);
                    else
                        socket.emit('output', res);
                });
                socket.on('user', function (usr) {
                    var whiteSpacePattern = /^\s*$/;

                    if (whiteSpacePattern.test(usr.email) || whiteSpacePattern.test(usr.passwd)) {
                        socket.emit('er', "Adres email i haslo nie moze byc puste.");
                    }
                    else {
                        col.insert({ email: usr.email, usr: msg.passwd })
                        io.emit('user', {
                            email: usr.email,
                            passwd: usr.passwd
                        });
                    }
                });

            });
        }

    });





function load() {
		document.getElementById('register').style="display:none;";
		document.getElementById('check').value="Register";
	}
	function register () {
		document.getElementById('register').style="height:100%;";
		document.getElementById('login').style="display:none";
		document.getElementById('check').value="Login";
		//document.getElementById('header').style="display:none";
	}
	function login () {
		document.getElementById('register').style="display:none;";
		document.getElementById('login').style="display:block;";
		document.getElementById('check').value="Register";
		//document.getElementById('header').style="display:none";
	}
	function check () {
		
		var che= document.getElementById('check').value;
		if(che=="Login")
		{
		document.getElementById('register').style="display:none;";
		document.getElementById('login').style="display:block;";
		document.getElementById('check').value="Register";
		}
		else
		{
			document.getElementById('register').style="height:100%;";
			document.getElementById('login').style="display:none";
			document.getElementById('check').value="Login";
		}
		
	}
	function validation()
	{
		
		var check=document.getElementById('email').type;
		if(check=="email")
		{
			var value=document.getElementById('email').value;
			if(value=="")
			{

				document.getElementById('error').innerHTML="Incorrect Email Address";

			}
		}
	}

