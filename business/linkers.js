var {PythonShell} = require("python-shell");
var path = require("path");


function onTestePy(){
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
 
        console.log(message)
        var userData = JSON.parse(message);
        // if(returnMessage.message){
        //     M.toast({html: returnMessage.message, classes: 'toast-custom-success valign-wrapper'})
        // }
        document.getElementById("idNome").innerHTML = userData.name.toUpperCase();
        document.getElementById("idCurrencyBalance").innerHTML = userData.currency + " " + userData.balance;
        
        hideLoaderDiv();
        showCopiarDiv();
    
    })
}
