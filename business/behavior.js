function initBehavior(){
    getDataFromSystemFile();
    getMenuItemsAndSetEvent();
    getInputFieldAndSetEvent();
    verifyStartInputsBehavior();
    getHistoryData();
}


function getMenuItemsAndSetEvent(){
    var elements = document.getElementsByClassName("menu-item");
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', onMenuItemClick, false);
    }
}

function onMenuItemClick() {
    event.preventDefault();
    var elements = document.getElementsByClassName("menu-item active");
    elements[0].classList.remove("active");
    this.classList.add("active");

    var itemText = this.innerText.split(/\r?\n/);
    /*MENU*/
    changeMenuTitle(itemText[1]);
    /*BODY*/
    changeBodyItem(itemText[1]);
};

function changeMenuTitle(_itemText){
    document.getElementById("idMenuTitle").innerHTML = _itemText;
}

function onInputFieldClick(){
    event.preventDefault();
    var input = this.getElementsByClassName("input-value")[0];
    var elements = this.getElementsByClassName("input-label active");
    if(elements[0] != undefined && input.value == '')
        elements[0].classList.remove("active");
    this.getElementsByClassName("input-label")[0].classList.add("active");
}

function onInputLostFocus(event){
    event.preventDefault();
    var input = this.getElementsByClassName("input-value")[0];
    var elements = this.getElementsByClassName("input-label active");
    if(elements[0] != undefined && input.value == '')
        elements[0].classList.remove("active");
}

function getInputFieldAndSetEvent(){
    var elements = document.getElementsByClassName("input-field");
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('focusin', onInputFieldClick, false);
    }
    var inputElements = document.getElementsByClassName("input-field");
    for (var i = 0; i < inputElements.length; i++) {
        inputElements[i].addEventListener('focusout', onInputLostFocus, false);
    }
}


function changeBodyItem(_item){
    hideAllDivs();
    switch(_item){
        case "LOGIN CORRETORA":
            showLoginDiv();
            break;
        case "GERENCIAMENTO":
            showGerenciamentoDiv();
            break;
        case "COPIAR TRADERS":
            showCopiarDiv();
            break;
        case "HISTÓRICO":
            showHistoricoDiv();
            break;
        default:
            break;
    }
}

function verifyStartInputsBehavior(){
    var inputs = document.getElementsByClassName("input-label");
    for (let index = 0; index < inputs.length; index++) {
        const input = inputs[index];
        const inputValue = document.getElementById(input.getAttribute("for")).value;
        if(input != undefined && inputValue == ""){
            input.classList.remove("active");
        }else{
            input.classList.add("active");
        }
    }
}

window.onload = function() {
    initBehavior();
    initBusiness();
};