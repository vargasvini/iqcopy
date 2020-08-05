var {PythonShell} = require("python-shell");
var path = require("path");
const {promisify} = require('util');


var pyshell;
var idIntervalFinderBackend = "";
var idIntervalFinderFile = "";
var progress = 1;


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
        if (userData.message == 'error'){
            M.toast({html: 'Autenticação inválida! Por favor, verifique os dados informados na área "LOGIN CORRETORA".', classes: 'toast-custom-error valign-wrapper'}) 
        }
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
        document.getElementById("idDivAtividadesLog").innerHTML = auxData;
    }
    
}

function clearLogsContent(){
    const fs = require('fs')
    fs.writeFile('findtrader.log', '', function(){})
}

function startProgressBar(){
    progress = 0;
    document.getElementById("idProgressBar").style.width = "0%"
}


async function checkFinderTimeRemaining (dt){
    progress +=0.166667

    if(progress >= 100){
        progress = 100;
    }

    document.getElementById("idProgressBar").style.width = progress+"%"
    if(Date.now() >= dt){
        if (pyshell != undefined){
            pyshell.childProcess.kill();
        }
        clearInterval(idIntervalFinderBackend)
        clearInterval(idIntervalFinderFile)
        idIntervalFinderBackend = "";
        idIntervalFinderFile = "";
    }
}

async function onStartFinder(){
    const dt = new Date(Date.now())
    dt.setMinutes(dt.getMinutes() + 10);

    if (pyshell != undefined){
        pyshell.childProcess.kill();
    }
    if (idIntervalFinderBackend != ""){
        clearInterval(idIntervalFinderBackend)
    }
    if (idIntervalFinderFile != ""){
        clearInterval(idIntervalFinderFile)
    }

    clearLogsContent();
    startProgressBar();

    idIntervalFinderBackend = setInterval(checkFinderTimeRemaining, 1000, dt)
    idIntervalFinderFile = setInterval(getFindTraderData, 1000)

    document.getElementById('idFindTraderTBody').innerHTML ="";
    var nome = document.getElementById("idTraderNome").value;
    var sobrenome = document.getElementById("idTraderSobrenome").value;
    
    var options = {
        scriptPath: path.join(__dirname, './backend/'),
        args: [nome, sobrenome]
    }

    const callTraderFinder = promisify(this.runPyShell);
    const returnPyshell = await callTraderFinder("findtrader.py", options);
}


function runPyShell(scriptPath, options, callback) {
    pyshell = new PythonShell(scriptPath, options);
    let output = [];
    return pyshell.on('message', function (message) {
        output.push(message);
    }).end(function (err) {
        return callback(err ? err : null, output.length ? output : null);
    });
}

/*GET TRADER FINDER RESULT DATA*/
async function getFindTraderData(){
    var fs = require('fs');
    var _data = fs.readFileSync('findtrader.log', {encoding:'utf8', flag:'r'})
    if(_data != ""){
        var dataFormat = "["+_data.slice(0, -1)+"]";
        processFindTraderData(dataFormat); 
    }
}

async function processFindTraderData(_data) {
    var findTraderData = JSON.parse(_data);
    appendFindTraderData(findTraderData)
}

async function appendFindTraderData(data) {
    var html = '';
    $.each(data, function(index, item){
        html += `
        <tr>
            <td>${item.rank}</td>
            <td>${item.userid}</td>
            <td>${item.nome}</td>
            <td>${item.faturamento}</td>
            <td>${item.pais}</td>
        `
            if(item.img == 'Imagem nao disponivel'){
                html += `
                <td><img src="./style/user.png" alt="" class="circle" style="height: 50px;"></td>
                </tr>
                `
            }else{
                html += `
                <td><img src="${item.img}" alt="" class="circle" style="height: 50px;"></td>
                </tr>
                `
            }
        });
    document.getElementById('idFindTraderTBody').innerHTML = html;
}