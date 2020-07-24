function showLoginDiv(){
    document.getElementById("idDivLogin").style="display:block";
}

function showGerenciamentoDiv(){
    document.getElementById("idDivGerenciamento").style="display:block";
}

function showCopiarDiv(){
    document.getElementById("idDivCopiar").style="display:block";
}
function hideCopiarDiv(){
    document.getElementById("idDivCopiar").style="display:none";    
}

function hideAllDivs(){
    document.getElementById("idDivLogin").style="display:none";
    document.getElementById("idDivGerenciamento").style="display:none";
    document.getElementById("idDivCopiar").style="display:none";
}

function hideLoaderDiv(){
    document.getElementById("idDivLoader").style="display:none";
}

function showLoaderDiv(){
    document.getElementById("idDivLoader").style="display:block";
}