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
    setInterval(readActivitiesLog, 2000)
    //setTimeout(readActivitiesLog, 30)
}

function setUserData(_data){
    document.getElementById("idNome").innerHTML = _data.name.toUpperCase();
    document.getElementById("idCurrencyBalance").innerHTML = _data.currency + " " + _data.balance;
}

async function callCopy(){    
    var options = {
        scriptPath: path.join(__dirname, './backend/'),
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

    if(Date.now() >= dt){
        if (pyshell != undefined){
            pyshell.childProcess.kill();
        }
        clearInterval(idIntervalFinderBackend)
        clearInterval(idIntervalFinderFile)
        idIntervalFinderBackend = "";
        idIntervalFinderFile = "";
        progress = 100
    }

    document.getElementById("idProgressBar").style.width = progress+"%"
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
    var pais = document.getElementById('idCountrySelect').value;
    var start = document.getElementById('idStartTop').value;

    var options = {
        scriptPath: path.join(__dirname, './backend/'),
        args: [nome, pais, start]
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
    var userIdList = [];
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
                <td><img src="./images/user.png" alt="" class="circle" style="height: 50px;"></td>
                `
            }else{
                html += `
                <td><img src="${item.img}" alt="" class="circle" style="height: 50px;"></td>
                `
            }
            html += `<td id="idBtnAdd${item.userid}"><i class="material-icons right finder-add-icon">add_box</i></td>
            </tr>`
            userIdList.push(`${item.userid}`)
        });
    document.getElementById('idFindTraderTBody').innerHTML = html;
    for (let index = 0; index < userIdList.length; index++) {
        document.getElementById(`idBtnAdd${userIdList[index]}`).addEventListener('click', function (event) {
            addToFollowList(`${userIdList[index]}`)
            event.preventDefault();
        });
    }

}

function addToFollowList(userId){
    var idsToFollow = $('#idFollowIds').val();
    if(verifyIdAlreadyAdded(idsToFollow, userId)){
        $('#idFollowIds').val('');
        if(idsToFollow == ''){
            idsToFollow  = userId
        }else{   
            idsToFollow += "," + userId
        }
        idsToFollow.replace(/,\s*$/, "");
        $('#idFollowIds').val(idsToFollow);
        document.getElementById('idFollowIdsLabel').classList.add("active");
    }
}

function verifyIdAlreadyAdded(idList, currId){
    idArr = idList.split(',');
    for (let index = 0; index < idArr.length; index++) {
        if(idArr[index] == currId){
            M.toast({html: 'O TRADER SELECIONADO JÁ FOI ADICIONADO NA LISTA!', classes: 'toast-custom-warning valign-wrapper', displayLength: 1000})
            return false;
        }
    }
    return true;
}

