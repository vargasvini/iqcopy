function initBusiness(){
    console.log('initBusiness')
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
        login: document.getElementById("idLoginUser").value,
        password: document.getElementById("idLoginPass").value
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
    var config = `[acesso] \
    \nlogin=${_formData.login.trim()} \
    \nsenha=${_formData.password.trim()} \ `;

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
    processDataSystem(data); 
}

function processDataSystem(_data) {
    var formData = JSON.parse(_data);

    document.getElementById("idLoginUser").value = formData.login;
    document.getElementById("idLoginPass").value = formData.password;
}


/*GET HISTORY DATA*/
function getHistoryData(){
    var fs = require('fs');
    const data = fs.readFileSync('resultados.log.config', {encoding:'utf8', flag:'r'}); 
    processHistoryData(data); 
}

function processHistoryData(_data) {
    const historyData = JSON.parse(_data);
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
                <td>${item.valor}</td>
                <td>${item.operacao.toUpperCase()}</td>
                <td>${item.timeframe.replace("PT","")}</td>
                <td>${item.paridade}</td>
                <td>${moment(item.data).format("DD/MM/YYYY hh:mm")}</td>
            </tr>
        `
        });
    return html;
}