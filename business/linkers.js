var {PythonShell} = require("python-shell");
var path = require("path");
const { setMaxListeners } = require("process");

async function onStartCopy(){
    // removeMenuClick();
    // hideCopiarDiv();
    // showLoaderDiv();
    callCopy();
    setInterval(readActivitiesLog, 5)
    //setTimeout(readActivitiesLog, 30)
}

function setUserData(_data){
    document.getElementById("idNome").innerHTML = _data.name.toUpperCase();
    document.getElementById("idCurrencyBalance").innerHTML = _data.currency + " " + _data.balance;
}

async function callCopy(){    
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
    
    var login = new PythonShell('copytrade.py', options);
    
    login.on('message', function(message){
        var userData = JSON.parse(message);
        setUserData(userData);
        if (userData.message == 'error'){
            M.toast({html: 'Autenticação inválida! Por favor, verifique os dados informados na área "LOGIN CORRETORA".', classes: 'toast-custom-error valign-wrapper'}) 
        }
        // hideLoaderDiv();
        // showCopiarDiv();
        // setMenuClick();
    })
}

async function readActivitiesLog(){
    var auxData = '';
    var data = '';
    auxData = data;

    var fs = require('fs');
    data = fs.readFileSync('atividades.log', {encoding:'utf8', flag:'r'});
    if(auxData != data){
        auxData = data;
        //console.log(auxData)
        document.getElementById("idDivAtividadesLog").innerHTML = auxData;
    }
    
}


function onEndCopy(){
    var options = {
        scriptPath: path.join(__dirname, './backend/'),
    }
    
    var exit = new PythonShell('exit.py', options);
}