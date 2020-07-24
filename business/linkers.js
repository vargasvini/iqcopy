var {PythonShell} = require("python-shell");
var path = require("path");


function onStartCopy(){
    removeMenuClick();
    hideCopiarDiv();
    showLoaderDiv();

    var real = '';
    if (document.getElementById('radioReal').checked) {
        real = 'REAL';
    }else{
        real = 'TREINAMENTO';
    }

    var options = {
        scriptPath: path.join(__dirname, './backend/'),
        args: [real]
    }
    
    var login = new PythonShell('login.py', options);
    
    login.on('message', function(message){
        var userData = JSON.parse(message);
        setUserData(userData);
        if (userData.message == 'error'){
            M.toast({html: 'Autenticação inválida! Por favor, verifique os dados informados na área "LOGIN CORRETORA".', classes: 'toast-custom-error valign-wrapper'}) 
        }
        hideLoaderDiv();
        showCopiarDiv();
        setMenuClick();
    })
}

function setUserData(_data){
    document.getElementById("idNome").innerHTML = _data.name.toUpperCase();
    document.getElementById("idCurrencyBalance").innerHTML = _data.currency + " " + _data.balance;
}
