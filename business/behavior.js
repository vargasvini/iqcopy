function initBehavior(){
    getDataFromSystemFile();
    getMenuItemsAndSetEvent();
    getInputFieldAndSetEvent();
    verifyStartInputsBehavior();
    getHistoryData();
    clearLogsContent(); 
    setCountryOptions();   
    setSelectType();
    
}

function setSelectType(){
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, elems.options);
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
    if(this.getElementsByClassName("input-label")[0] != undefined)
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
        case "SELECIONAR TRADER":
            showSelecionarTraderDiv();
            break;
        case "GERENCIAMENTO":
            showGerenciamentoDiv();
            break;
        case "CONFIGURAÇÕES":
            showConfigDiv();
            break;
        case "INICIAR CÓPIA":
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

function setCountryOptions(){
    var sel = document.getElementById('idCountrySelect'); 

    var idContry = {
        "Worldwide":0,
        "BR": 30,
        "AF": 1,
        "AL": 2,
        "DZ": 3,
        "AD": 5,
        "AO": 6,
        "AI": 7,
        "AG": 9,
        "AR": 10,
        "AM": 11,
        "AW": 12,
        "AT": 14,
        "AZ": 15,
        "BS": 16,
        "BH": 17,
        "BD": 18,
        "BB": 19,
        "BY": 20,
        "BZ": 22,
        "BJ": 23,
        "BM": 24,
        "BO": 26,
        "BA": 27,
        "BW": 28,
        "BV": 29,
        "BN": 31,
        "BG": 32,
        "BF": 33,
        "BI": 34,
        "KH": 35,
        "CM": 36,
        "CV": 38,
        "KY": 39,
        "TD": 41,
        "CL": 42,
        "CN": 43,
        "CC": 45,
        "CO": 46,
        "KM": 47,
        "CG": 48,
        "CK": 49,
        "CR": 50,
        "CI": 51,
        "HR": 52,
        "CU": 53,
        "CY": 54,
        "CZ": 55,
        "DK": 56,
        "DJ": 57,
        "DM": 58,
        "DO": 59,
        "TL": 60,
        "EC": 61,
        "EG": 62,
        "SV": 63,
        "EE": 66,
        "ET": 67,
        "FO": 69,
        "FJ": 70,
        "FI": 71,
        "FR": 72,
        "GF": 73,
        "PF": 74,
        "GA": 75,
        "GM": 76,
        "GE": 77,
        "DE": 78,
        "GH": 79,
        "GR": 81,
        "GD": 83,
        "GP": 84,
        "GT": 86,
        "GN": 87,
        "GY": 88,
        "HT": 89,
        "HN": 90,
        "HK": 91,
        "HU": 92,
        "IS": 93,
        "ID": 94,
        "IQ": 95,
        "IE": 96,
        "IT": 97,
        "JM": 98,
        "JO": 100,
        "KZ": 101,
        "KE": 102,
        "KI": 103,
        "KW": 104,
        "KG": 105,
        "LA": 106,
        "LV": 107,
        "LB": 108,
        "LS": 109,
        "LR": 110,
        "LY": 111,
        "LT": 113,
        "LU": 114,
        "MO": 115,
        "MK": 116,
        "MG": 117,
        "MW": 118,
        "MY": 119,
        "MV": 120,
        "ML": 121,
        "MT": 122,
        "MQ": 124,
        "MR": 125,
        "MU": 126,
        "MX": 128,
        "FM": 129,
        "MD": 130,
        "MC": 131,
        "MN": 132,
        "MA": 134,
        "MZ": 135,
        "MM": 136,
        "NA": 137,
        "NP": 139,
        "NL": 140,
        "AN": 141,
        "NC": 142,
        "NZ": 143,
        "NI": 144,
        "NE": 145,
        "NG": 146,
        "NO": 149,
        "OM": 150,
        "PK": 151,
        "PW": 152,
        "PA": 153,
        "PG": 154,
        "PY": 155,
        "PE": 156,
        "PH": 157,
        "PL": 159,
        "PT": 160,
        "QA": 162,
        "RE": 163,
        "RO": 164,
        "RW": 166,
        "KN": 167,
        "LC": 168,
        "SA": 171,
        "SN": 172,
        "SC": 173,
        "SG": 175,
        "SK": 176,
        "SI": 177,
        "SO": 179,
        "ZA": 180,
        "KR": 181,
        "ES": 182,
        "LK": 183,
        "SH": 184,
        "SR": 186,
        "SZ": 187,
        "SE": 188,
        "CH": 189,
        "TW": 191,
        "TJ": 192,
        "TZ": 193,
        "TH": 194,
        "TG": 195,
        "TT": 198,
        "TN": 199,
        "TR": 200,
        "TM": 201,
        "UG": 203,
        "UA": 204,
        "AE": 205,
        "GB": 206,
        "UY": 207,
        "UZ": 208,
        "VE": 211,
        "VN": 212,
        "VG": 213,
        "YE": 216,
        "ZM": 218,
        "ZW": 219,
        "RS": 220,
        "ME": 221,
        "IN": 225,
        "TC": 234,
        "CD": 235,
        "GG": 236,
        "IM": 237,
        "JE": 239,
        "CW": 246, 
    }
    
    $.each(idContry, function(index, item){
        var opt = document.createElement('option');
        if (index == "Worldwide"){
            opt.appendChild(document.createTextNode("TODOS"));
            opt.setAttribute("selected","selected")
        }else{
            opt.appendChild(document.createTextNode(index));
            opt.setAttribute("data-icon","./images/countries/"+index+".png")
        }
        opt.value = index;
        sel.appendChild(opt); 
    });
}

window.onload = function() {
    initBehavior();
    initBusiness();
};