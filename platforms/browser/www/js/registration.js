

function load() {
    document.getElementById('register').style = "display:none;";
    document.getElementById('check').value = "Rejestracja";
}
function register() {
    document.getElementById('register').style = "height:100%;";
    document.getElementById('login').style = "display:none";
    document.getElementById('check').value = "Logowanie";
    //document.getElementById('header').style="display:none";
}
function login() {
    document.getElementById('register').style = "display:none;";
    document.getElementById('login').style = "display:block;";
    document.getElementById('check').value = "Rejestracja";
    //document.getElementById('header').style="display:none";
}
function check() {

    var che = document.getElementById('check').value;
    if (che == "Logowanie") {
        document.getElementById('register').style = "display:none;";
        document.getElementById('login').style = "display:block;";
        document.getElementById('check').value = "Rejestracja";
    }
    else {
        document.getElementById('register').style = "height:100%;";
        document.getElementById('login').style = "display:none";
        document.getElementById('check').value = "Logowanie";
    }

}
function validation() {

    var check = document.getElementById('email').type;
    if (check == "email") {
        var value = document.getElementById('email').value;
        if (value == "") {

            document.getElementById('error').innerHTML = "Incorrect Email Address";

        }
    }
}

