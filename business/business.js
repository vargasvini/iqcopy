
function initBusiness(){
    checkFiles();
    $("#idDivAccessLogo").removeClass('slide_logo')
    document.getElementById("idAccessKey").value = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
    getAccess()
}

function checkFiles(){
    const fs = require('fs')
    const path = 'system.config'
    
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
  let response = await fetch(`http://meutrader-com.umbler.net/users`);
  let data = await response.json()
  return data;
}

function verifyAccess(data){
    var aKey = document.getElementById("idAccessKey").value
    // 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
    if (data.some(item => item.accesskey === aKey.trim() && item.isActive == true))
    {
        hideAccessItem();
        $("#idDivAccessLogo").addClass('slide_logo')
        setTimeout(() => {
        hideAccessDiv();
        }, 495);
    }else{
        showAccessDiv();
        return;
    }
}

function onSaveConfig(){
    event.preventDefault();
    if(writeToConfigFile() && writeToSystemFile()) {
        document.getElementById("idBtnSaveConfig").disabled = true;
        M.toast({html: 'CONFIGURAÇÃO SALVA COM SUCESSO!', classes: 'toast-custom-success valign-wrapper', displayLength: 1000, completeCallback: function(){document.getElementById("idBtnSaveConfig").disabled = false;}})
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
        tipoExpiracao: getRadioVal(document.getElementById('divOptionsExpiracao'), 'groupTempExpiracao')
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
    // /*Configurações*/
    document.querySelectorAll(`input[value=${formData.tipoConta}]`)[0].checked = true;
    document.querySelectorAll(`input[value=${formData.tipoOpcoes}]`)[0].checked = true;
    document.querySelectorAll(`input[value=${formData.tipoExpiracao}]`)[0].checked = true;
}

/*GET HISTORY DATA*/
function getHistoryData(){
    var fs = require('fs');
    try{
        const data = fs.readFileSync('resultados.log.config', {encoding:'utf8', flag:'r'}); 
        if(data != ""){
            var dataFormat = "["+data.slice(0, -1)+"]";
            processHistoryData(dataFormat); 
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

function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_, i) => i)
}

function customSort(a, b) {    
    return new Date(b.data).getTime() - new Date(a.data).getTime();
}