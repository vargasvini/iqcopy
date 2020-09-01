function initBusiness(){
    checkFiles();
    $("#idDivAccessLogo").removeClass('slide_logo')
    document.getElementById("idAccessKey").value = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
    if(document.getElementById("idAccessKey").value != ""){
        document.getElementById("idAccessKeyLabel").classList.add("active");
    }
}

function checkFiles(){
    const fs = require('fs')
    checkSystemConfig(fs);
    checkCopyConfig(fs);
    checkResultadosConfig(fs);
}

function checkSystemConfig(fs){
    const path = 'system.config'
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '', 'utf8', function(err) {
            if (err) 
                isSaved = false;
        });
    }
}

function checkCopyConfig(fs){
    const path = 'copy.config'
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, createConfig(createFormData()), 'utf8', function(err) {
            if (err) 
                isSaved = false;
        });
    }
}

function checkResultadosConfig(fs){
    const path = 'resultados.log.config'
    if (!fs.existsSync(path)) {
        fs.writeFileSync(path, '', 'utf8', function(err) {
            if (err) 
                isSaved = false;
        });
    }
}

function onEntrar(){
    getAccess();
}

function getAccess(){
    getUserAsync()
    .then(data => verifyAccess(data)); 
}

async function getUserAsync() 
{
  let response = await fetch(`http://meutrader-com.umbler.net/getUsers`);
  let data = await response.json()
  return data;
}

function verifyAccess(data){
    var aKey = document.getElementById("idAccessKey").value
    // 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
    if (data.some(item => item.accessKey === aKey.trim() && item.isActive == true))
    {
        hideAccessItem();
        $("#idDivAccessLogo").addClass('slide_logo')
        setTimeout(() => {
        hideAccessDiv();
        }, 495);
    }else{
        M.toast({html: 'ERRO AO ACESSAR O SISTEMA: CHAVE INVÁLIDA!', classes: 'toast-custom-error valign-wrapper', displayLength: 2000})
        showAccessDiv();
        return;
    }
}

function onSaveConfig(isCopy){
    event.preventDefault();
    if(writeToConfigFile() && writeToSystemFile()) {
        document.getElementById("idBtnSaveConfig").disabled = true;
        if(!isCopy)
            M.toast({html: 'CONFIGURAÇÃO SALVA COM SUCESSO!', classes: 'toast-custom-success valign-wrapper', displayLength: 1000, completeCallback: enableSaveBtn()})
        else{
            setTimeout(() => {
                enableSaveBtn();
            }, 2000); 
        }
    } 
    else{
        document.getElementById("idBtnSaveConfig").disabled = true;
    }
}

/*GENERIC FORM WITH INPUT DATA*/
function createFormData(){
    var formData = { 
        /*Login Corretora*/
        login: document.getElementById("idLoginUser").value,
        password: document.getElementById("idLoginPass").value,
        /*Acesso*/
        userKey: document.getElementById("idAccessKey").value,
        /*Selecionar Trader*/
        tipoFollow: getRadioVal(document.getElementById('divFollowOptions'), 'groupFollowOpcoes'),
        followRank: document.getElementById("idFollowRank").value,
        followId: document.getElementById("idFollowIds").value,
        blockId: document.getElementById("idBlockIds").value,
        /*Gerenciamento*/
        tipoGerenciamento: getRadioVal(document.getElementById('divOptionsGerenciamento'), 'groupTipoEntrada'),
        valorEntrada: $('#idValorEntrada').maskMoney('unmasked')[0],
        qtdMartingales: document.getElementById('idQtdMartingale').value,
        valorStopWin: $('#idValorStopWin').maskMoney('unmasked')[0],
        valorStopLoss: $('#idValorStopLoss').maskMoney('unmasked')[0],
        valorMinimoTrader: $('#idValorMinimoTrader').maskMoney('unmasked')[0],
        /*Configurações*/
        tipoConta: getRadioVal(document.getElementById('divOptionsConta'), 'groupTipoConta'),
        tipoOpcoes: getRadioVal(document.getElementById('divOptionsOpcoes'), 'groupTipoOpcoes'),
        tipoExpiracao: getRadioVal(document.getElementById('divOptionsExpiracao'), 'groupTempExpiracao'),
        selectedParidades: getParidadesSelected()
    }
    return formData;
}

/*COPY CONFIG FILE*/
function writeToConfigFile() {
    var isSaved = true;
    var fs = require("fs");

    fs.writeFileSync('copy.config', createConfig(createFormData()), 'utf8', function(err) {
        if (err) 
            isSaved = false;
    });

    return isSaved;
}

function createConfig(_formData){
    var config=``;
    config += `[acesso]`
    config += `\nlogin=${_formData.login.trim()}`
    config += `\nsenha=${_formData.password.trim()}`
    config += `\nuserKey=${_formData.userKey.trim()}`

    config += `\n[seguirTrader]`
    config += `\ntipoFollow=${_formData.tipoFollow.trim()}`
    config += `\nfollowRank=${_formData.followRank.trim()}`
    config += `\nfollowId=${_formData.followId.trim()}`
    config += `\nblockId=${_formData.blockId.trim()}`

    config += `\n[gerenciamento]`
    config += `\ntipoGerenciamento=${_formData.tipoGerenciamento.trim()}`
    config += `\nvalorEntrada=${_formData.valorEntrada}`
    config += `\nqtdMartingales=${_formData.qtdMartingales}`
    config += `\nvalorStopWin=${_formData.valorStopWin}`
    config += `\nvalorStopLoss=${_formData.valorStopLoss}`
    config += `\nvalorMinimoTrader=${_formData.valorMinimoTrader}`

    config += `\n[configuracoes]`
    config += `\ntipoConta=${_formData.tipoConta.trim()}`
    config += `\ntipoOpcoes=${_formData.tipoOpcoes.trim()}`
    config += `\ntipoExpiracao=${_formData.tipoExpiracao.trim()}`
    config += `\nselectedParidades=${_formData.selectedParidades.trim()}`
    
    return config;
}

/*SYSTEM INPUT CONFIG FILE*/
function writeToSystemFile() {
    var isSaved = true;
    var fs = require("fs");
    var json = JSON.stringify(createSystemData(createFormData()));

    fs.writeFileSync('system.config', json, 'utf8', function(err) {
        if (err) 
            isSaved = false;
    });

    return isSaved;
}

function createSystemData(_formData){
    return _formData;
}

function getDataFromSystemFile(){
    var fs = require('fs');
    const data = fs.readFileSync('system.config', {encoding:'utf8', flag:'r'}); 
    if(data != ""){
        processDataSystem(data); 
    }
}

function processDataSystem(_data) {
    var formData = JSON.parse(_data);
    /*Login Corretora*/
    document.getElementById("idLoginUser").value = formData.login;
    document.getElementById("idLoginPass").value = formData.password;
    /*Selecionar Trader*/
    document.querySelectorAll(`input[value=${formData.tipoFollow}]`)[0].checked = true;
    document.getElementById("idFollowRank").value = formData.followRank;
    document.getElementById("idFollowIds").value = formData.followId;
    document.getElementById("idBlockIds").value = formData.blockId;
    /*Gerenciamento*/
    document.querySelectorAll(`input[value=${formData.tipoGerenciamento}]`)[0].checked = true;
    $('#idValorEntrada').val(`R$ ${formData.valorEntrada.toFixed(2).replace(".",",")}`);
    document.getElementById('idQtdMartingale').value = formData.qtdMartingales;
    $('#idValorStopWin').val(`R$ ${formData.valorStopWin.toFixed(2).replace(".",",")}`);
    $('#idValorStopLoss').val(`R$ ${formData.valorStopLoss.toFixed(2).replace(".",",")}`);
    $('#idValorMinimoTrader').val(`R$ ${formData.valorMinimoTrader.toFixed(2).replace(".",",")}`);
    /*Configurações*/
    document.querySelectorAll(`input[value=${formData.tipoConta}]`)[0].checked = true;
    document.querySelectorAll(`input[value=${formData.tipoOpcoes}]`)[0].checked = true;
    document.querySelectorAll(`input[value=${formData.tipoExpiracao}]`)[0].checked = true;
    setParidadesSelected(formData.selectedParidades);    
}


/*PARIDADES*/
function getParidadesSelected(){
    var selected = "";
    for (var option of document.getElementById('idParidadesSelect').options) {
        if (option.selected) {
            if(selected == ""){
                selected = option.value
            }
            else{
                selected += "," + option.value
            }   
        }
    }
    if(selected == "")
        selected = "TODAS"
    return selected;
}
function setParidadesSelected(_paridades){
    try{
        var arrayParidades = _paridades.split(",");
        for (var option of document.getElementById('idParidadesSelect').options) {
            if(arrayParidades.includes(option.value)){
                option.selected = true
            }else{
                option.selected = false
            }
        }
    }
    catch{
        return
    }
}

/*GET HISTORY DATA*/
function getHistoryData(){
    var fs = require('fs');
    try{
        const data = fs.readFileSync('resultados.log.config', {encoding:'utf8', flag:'r'}); 
        if(data != ""){
            var dataFormat = "["+data.slice(0, -1)+"]";
            processHistoryData(dataFormat);
            getTradesToPost(dataFormat);
        }
    }
    catch{
        return;
    }   
}

function processHistoryData(_data) {
    const historyData = JSON.parse(_data);
    historyData.sort(customSort)    
    paginationHistoryData(historyData);
}

function paginationHistoryData(item){
    $('#pagination-history-container').pagination({
        locator: 'data',
        dataSource: item,
        callback: function(data, pagination) {
            // template method of yourself
            var html = historyDataTemplate(data);
            $('#data-history-container').html(html);
        }
    })
}

function historyDataTemplate(data) {
    var html = '';
    $.each(data, function(index, item){
        html += `
            <tr>
                <td>${item.id}</td>
                <td>${item.nome}</td>
                <td>${item.resultado}</td>
                <td>${item.valor.toFixed(2).replace(".",",")}</td>
                <td>${item.operacao.toUpperCase()}</td>
                <td>${item.timeframe.replace("PT","")}</td>
                <td>${item.paridade}</td>
                <td>${moment(item.data).format("DD/MM/YYYY HH:mm")}</td>
            </tr>
        `
    });  
    return html;
}

function getTradesToPost(dataFormat){
    const historyData = JSON.parse(dataFormat); 
    try{
        var result = verifyTrades(historyData)
        gAuxHistory = []
        var lenTrades = 0;
        if((Array.isArray(result[0]) && result[0].length) && (Array.isArray(result[1]))){
            lenTrades = result[0].length+result[1].length == 0? 1 : result[0].length+result[1].length;
            gAuxHistory = gAuxHistory.concat(result[1])
            for (let index = 0; index < result[0].length; index++) {
                postTrades(result[0][index], result[1])
                .then(function(response){
                    if(lenTrades == gAuxHistory.length){
                        writeNewHistoryFileAfterPost()
                    }
                })
            }          
        }
    }
    catch (e){
        console.log(e)
        return;
    }   
}

function verifyTrades(data){
    tradesToPost = [];
    tradesToUpdate = [];

    $.each(data, function(index, item){
        if(!item.isAtServer){
            tradesToPost.push(item);
        }else{
            tradesToUpdate.push(item);
        }
    });
    return [tradesToPost, tradesToUpdate];
}

function postTrades(item, dataToUpdate){
    const payload = {
        "traderId": item.id,
        "resultado": item.resultado,
        "paridade": item.paridade,
        "valor": item.valor,
        "operacao": item.operacao,
        "nome": item.nome,
        "timeframe": item.timeframe,
        "data": item.data,
        "opcao": item.opcao,
        "operationId": item.operationId,
        "userId": item.userId,
        "userKey": item.userKey,
    };

    return fetch(`http://meutrader-com.umbler.net/postTrades`,{
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },  
		body: JSON.stringify(payload)
	})
	.then(function(response){
        if(response.status == 200){
            item.isAtServer = true;
        }
        gAuxHistory.push(item)
    });
}

async function fetchPostHistory(_payload){
    fetch(`http://meutrader-com.umbler.net/postTrades`,{
        method: 'post',
        headers: {
            "Content-Type": "application/json"
        },  
        body: JSON.stringify(_payload)
    })
    .then(function(response){
        return response
    })
}

function writeNewHistoryFileAfterPost(){
    var fs = require('fs');
    var itensUpdated = JSON.stringify(gAuxHistory).replace("[","").replace("]","") +",";
    fs.writeFileSync('resultados.log.config', itensUpdated, 'utf8', function(err) {
        if (err) 
            console.log(err)
    });
}


/*GET TOP TRADERS DATA*/
async function getTradesAsync() 
{
    let response = await fetch(`http://meutrader-com.umbler.net/getTrades`);
    let data = await response.json()
    console.log(data);

    var queryResult = Enumerable.from(data).toArray()

    //CRIEI 3 NOVOS ATRIBUTOS
    for (let index = 0; index < queryResult.length; index++) {
        queryResult[index].saldo = 0
        queryResult[index].qtdWin = 0
        queryResult[index].qtdLoss = 0
        queryResult[index].valorOper = 0
        if(queryResult[index].resultado == 'WIN'){
            queryResult[index].qtdWin = 1
            queryResult[index].valorOper = queryResult[index].valor
        }else{
            queryResult[index].qtdLoss = -1
            queryResult[index].valorOper = queryResult[index].valor *-1
        }
    }
    
    //AGRUPEI ELES: SALDO = WIN(1) + LOSS (-1)
    var grouped = Enumerable.from(queryResult).groupBy("$.traderId", null, (key, g) => {
        return { 
            traderId: key, 
            nome: g.elementAt(0).nome,
            saldo: g.sum("$.qtdWin + $.qtdLoss | 0"),
            qtdWin: g.sum("$.qtdWin | 0"),
            qtdLoss: g.sum("$.qtdLoss *-1 | 0"),
            saldoValor: g.sum("$.valorOper | 0"),
       }
    }).toArray()
    
    processTopTradersData(grouped.sort(sortTradersSaldoMaxMin).slice(0, 100))

    // console.log(grouped)
    // console.log(Enumerable.from(grouped).where(x => x.saldo >=2).toArray()) //9wins
    //console.log(Enumerable.from(data).where(x => x.traderId == "76085554").toArray()) //9wins

    // var testMaxMin = Enumerable.from(grouped).where(x => x.saldo >=2).toArray();
    // var testMinMax = Enumerable.from(grouped).where(x => x.saldo >=2).toArray();
    
    // console.log(testMaxMin.sort(sortTradersSaldoMaxMin))
    // console.log(testMinMax.sort(sortTradersSaldoMinMax))

    // console.log(test.sort(sortTradersWinsMaxMin))
    // console.log(test.sort(sortTradersWinsMinMax))
    // var tradId = ""
    // for (let index = 0; index < test.length; index++) {
    //     if(tradId == ""){
    //         tradId = test[index].traderId;
    //     }
    //     else{
    //         tradId = tradId + "," + test[index].traderId 
    //     }
        
    // }
    // console.log(tradId)
}

function processTopTradersData(_data) {
    const topTradersData = _data;
    topTradersData.sort(customSort)    
    paginationTopTradersData(topTradersData);
}

function paginationTopTradersData(item){
    $('#pagination-toptraders-container').pagination({
        locator: 'data',
        dataSource: item,
        callback: function(data, pagination) {
            // template method of yourself
            var html = topTradersDataTemplate(data);
            $('#data-toptraders-container').html(html);
        }
    })
}

function topTradersDataTemplate(data) {
    var html = '';
    $.each(data, function(index, item){
        html += `
            <tr>
                <td>${item.traderId}</td>
                <td>${item.nome}</td>
                <td>${item.saldo}</td>
                <td>${item.qtdWin}</td>
                <td>${item.qtdLoss}</td>
                <td>${item.saldoValor.toFixed(2).replace(".",",")}</td>
            </tr>
        `
    });
        
    return html;
}

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i)
}

function customSort(a, b) {    
    return new Date(b.data).getTime() - new Date(a.data).getTime();
}

function sortTradersWinsMaxMin(a, b) {    
    return b.saldo - a.saldo;
}

function sortTradersWinsMinMax(a, b) {    
    return b.saldo + a.saldo;
}

function sortTradersSaldoMaxMin(a, b) {    
    return b.saldo - a.saldo;
}

function sortTradersSaldoMinMax(b, a) {    
    return b.saldo - a.saldo;
}