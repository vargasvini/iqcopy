function showRowFirstAccess(){
    document.getElementById("idRowFirstAccess").style="display:block";
} 
function hideRowFirstAccess(){
    document.getElementById("idRowFirstAccess").style="display:none";
} 
function showRowAccess(){
    document.getElementById("idRowAccess").style="display:block";
} 
function hideRowAccess(){
    document.getElementById("idRowAccess").style="display:none";
} 

function enableStartCopy(){
    document.getElementById("idBtnStartCopy").disabled = false;   
}

function disableStartCopy(){
    document.getElementById("idBtnStartCopy").disabled = true;
}

function enableStartFinder(){
    document.getElementById("idBtnPesquisarTrader").disabled = false;
}

function disableStartFinder(){
    document.getElementById("idBtnPesquisarTrader").disabled = true;
}

function hideAccessItem(){
    document.getElementById("divAccessKey").style="display:none";
    document.getElementById("divAccessBtn").style="display:none";
}

function showAccessDiv(){
    hideNavAndSave();
    document.getElementById("idDivAccess").style="display:block";
}

function hideAccessDiv(){
    showNavAndSave();
    document.getElementById("idDivAccess").style="display:none";
}

function showNavAndSave(){
    document.getElementById("idNavCustom").style="display:block";
    document.getElementById("rowSalvar").style="display:block";
}

function hideNavAndSave(){
    document.getElementById("idNavCustom").style="display:none";
    document.getElementById("rowSalvar").style="display:none";
}

function showLoginDiv(){
    document.getElementById("idDivLogin").style="display:block";
}

function showSelecionarTraderDiv(){
    document.getElementById("idDivSelecionarTrader").style="display:block";
}

function showGerenciamentoDiv(){
    document.getElementById("idDivGerenciamento").style="display:block";
}

function showConfigDiv(){
    document.getElementById("idDivConfig").style="display:block";
}

function showCopiarDiv(){
    document.getElementById("idDivCopiar").style="display:block";
}

function showHistoricoDiv(){
    document.getElementById("idDivHistorico").style="display:block";
}

function showTopTradersDiv(){
    document.getElementById("idDivTopTraders").style="display:block";
}

function hideTopTradersDiv(){
    document.getElementById("idDivTopTraders").style="display:none";
}


function hideCopiarDiv(){
    document.getElementById("idDivCopiar").style="display:none";    
}

function hideAllDivs(){
    document.getElementById("idDivLogin").style="display:none";
    document.getElementById("idDivSelecionarTrader").style="display:none";
    document.getElementById("idDivGerenciamento").style="display:none";
    document.getElementById("idDivConfig").style="display:none";
    document.getElementById("idDivCopiar").style="display:none";
    document.getElementById("idDivHistorico").style="display:none";
    document.getElementById("idDivTopTraders").style="display:none";
}

function hideLoaderDiv(){
    document.getElementById("idDivLoader").style="display:none";
}

function showLoaderDiv(){
    document.getElementById("idDivLoader").style="display:block";
}

function removeMenuClick(){
    document.getElementById("idDivMenu").style="pointer-events: none";
}

function setMenuClick(){
    document.getElementById("idDivMenu").style="pointer-events: all";
}

function enableSaveBtn(){
    document.getElementById("idBtnSaveConfig").disabled = false;
}