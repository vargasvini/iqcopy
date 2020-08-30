async function onStartCopy(){
    if (pyshellCopy != undefined){
        pyshellCopy.childProcess.kill();
    }
    if (idIntervalFinderBackend != ""){
        clearInterval(idIntervalCopyFile)
    }

    clearCopyLogsContent();
    disableStartCopy();

    debugger;
    if(isDev){
        filepath = path.join(__dirname, "./backend/");
    } else {
        filepath = path.join(__dirname, "./backend/");
        filepath = filepath.replace("app.asar", "app.asar.unpacked");
    }

    var options = {
        //scriptPath: path.join(__dirname, "./backend/"),
        scriptPath: filepath
    }
    
    idIntervalCopyFile = setInterval(readActivitiesLog, 2000)
    const callCopyTrader = promisify(this.runPyShellCopy);
    const returnPyshell = await callCopyTrader("copytrade.py", options);
    if(returnPyshell != null){
        verifyLoginError(returnPyshell)
    }
}

function verifyLoginError(returnPyshell){
    var userData = JSON.parse(returnPyshell);    
    if (userData.message == 'error'){
        M.toast({html: 'Autenticação inválida! Por favor, verifique os dados informados na área "LOGIN CORRETORA".', classes: 'toast-custom-error valign-wrapper', displayLength: 5000}) 
    }
    onStopCopy()
}

function onStopCopy(){
    if (pyshellCopy != undefined){
        pyshellCopy.childProcess.kill();
        enableStartCopy();
    }
}

function onStopFinder(){
    if (pyshell != undefined){
        pyshell.childProcess.kill();
        checkFinderTimeRemaining(new Date(Date.now()))
        enableStartFinder();
    }
}

function setUserData(_data){
    document.getElementById("idNome").innerHTML = _data.name.toUpperCase();
    document.getElementById("idCurrencyBalance").innerHTML = _data.currency + " " + _data.balance;
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

function clearCopyLogsContent(){
    const fs = require('fs')
    fs.writeFile('atividades.log', '', function(){})
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
    disableStartFinder();

    idIntervalFinderBackend = setInterval(checkFinderTimeRemaining, 1000, dt)
    idIntervalFinderFile = setInterval(getFindTraderData, 1000)

    document.getElementById('idFindTraderTBody').innerHTML ="";
    var nome = document.getElementById("idTraderNome").value;
    var pais = document.getElementById('idCountrySelect').value;
    var start = document.getElementById('idStartTop').value;

    if(isDev){
        filepath = path.join(__dirname, "./backend/");
    } else {
        filepath = path.join(process.resourcesPath, "iqcopy/backend/");
    }

    var options = {

        scriptPath: filepath,
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

function runPyShellCopy(scriptPath, options, callback) {
    pyshellCopy = new PythonShell(scriptPath, options);
    let output = [];
    return pyshellCopy.on('message', function (message) {
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
            html += `
            <td id="idBtnAdd${item.userid}" style="color:green;" class="idBtnAddFinder">SEGUIR</td>
            <td id="idBtnBlock${item.userid}" style="color:red;" class="idBtnBlockFinder">IGNORAR</td>
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
    for (let index = 0; index < userIdList.length; index++) {
        document.getElementById(`idBtnBlock${userIdList[index]}`).addEventListener('click', function (event) {
            addToBlockList(`${userIdList[index]}`)
            event.preventDefault();
        });
    }

}

function addToFollowList(userId){
    msg = 'O TRADER SELECIONADO JÁ FOI ADICIONADO!';
    var idsToFollow = $('#idFollowIds').val();
    if(verifyIdAlreadyAdded(idsToFollow, userId, msg)){
        removeFromBlockList(userId)
        $('#idFollowIds').val('');
        if(idsToFollow == ''){
            idsToFollow  = userId
        }else{   
            idsToFollow += "," + userId
        }
        idsToFollow.replace(/,\s*$/, "");
        $('#idFollowIds').val(idsToFollow);
        document.getElementById('idFollowIdsLabel').classList.add("active");
        M.toast({html: "TRADER ADICIONADO COM SUCESSO NA LISTA PARA SEGUIR", classes: 'toast-custom-success valign-wrapper', displayLength: 1000})
    }
}

function addToBlockList(userId){
    msg = 'O TRADER SELECIONADO JÁ FOI ADICIONADO NA LISTA DE BLOQUEIO!';
    var idsToBlock = $('#idBlockIds').val();
    if(verifyIdAlreadyAdded(idsToBlock, userId, msg)){
        removeFromFollowList(userId)
        $('#idBlockIds').val('');
        if(idsToBlock == ''){
            idsToBlock  = userId
        }else{   
            idsToBlock += "," + userId
        }
        idsToBlock.replace(/,\s*$/, "");
        $('#idBlockIds').val(idsToBlock);
        document.getElementById('idBlockIdsLabel').classList.add("active");
        M.toast({html: "TRADER ADICIONADO COM SUCESSO NA LISTA DE IGNORADOS", classes: 'toast-custom-success valign-wrapper', displayLength: 1000})
    }
}

function removeFromFollowList(currId){
    var idsToFollow = '';
    var idList = $('#idFollowIds').val();
    idArr = idList.split(',');
    for (let index = 0; index < idArr.length; index++) {
        if(idArr[index] == currId){
            idArr.splice(index, 0)
        }else {
            if(idsToFollow == ''){
                idsToFollow  = idArr[index]
            }else{   
                idsToFollow += "," + idArr[index]
            }
        }
    }
    idsToFollow.replace(/,\s*$/, "");
    $('#idFollowIds').val(idsToFollow);
}

function removeFromBlockList(currId){
    var idsToBlock = '';
    var idList = $('#idBlockIds').val();
    idArr = idList.split(',');
    for (let index = 0; index < idArr.length; index++) {
        if(idArr[index] == currId){
            idArr.splice(index, 0)
        }else {
            if(idsToBlock == ''){
                idsToBlock  = idArr[index]
            }else{   
                idsToBlock += "," + idArr[index]
            }
        }
    }
    idsToBlock.replace(/,\s*$/, "");
    $('#idBlockIds').val(idsToBlock);
}

function verifyIdAlreadyAdded(idList, currId, msg){
    idArr = idList.split(',');
    for (let index = 0; index < idArr.length; index++) {
        if(idArr[index] == currId){
            M.toast({html: msg, classes: 'toast-custom-warning valign-wrapper', displayLength: 1000})
            return false;
        }
    }
    return true;
}

