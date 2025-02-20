function initBehavior(){
    checkFiles();
    setCountryOptions();  
    setParidadesOptions(); 
    getDataFromSystemFile();
    getMenuItemsAndSetEvent();
    getInputFieldAndSetEvent();
    verifyStartInputsBehavior();
    thTopClicks();
    clearLogsContent(); 
    setSelectType();
    applyMasks();
    applyDefaultValueOnBlur();
    applyDefaultValues();
    setOptionsClick();
    selectParidadesBehavior();
    initMaterializeBehavior();
}

function initMaterializeBehavior(){
    addToolTips();
    var elems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(elems);
}

function addToolTips(){
    var tooltipText = "";
    tooltipText = 'Ao clicar em pesquisar, a ferramenta irá buscar todas as correspondências. <br>O progresso da busca é mostrado na barra verde. <br>Se você desejar pausar a busca antes de sua conclusão, clique em "parar".'
    document.getElementById("idBtnPesquisarTrader").classList.add("tooltipped");
    document.getElementById("idBtnPesquisarTrader").setAttribute("data-tooltip", tooltipText);
}

function addToolTipsDynamic(elementId, msgTooltip){
    document.getElementById(elementId).classList.add("tooltipped");
    document.getElementById(elementId).setAttribute("data-tooltip", msgTooltip);
    var elems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(elems);
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

    $('#idFollowIds').on('change, keyup', function() {
        var currentInput = $(this).val();
        var fixedInput = currentInput.replace(/[A-Za-z!@#$%^&*()]/g, '');
        $(this).val(fixedInput);        
    });

    $('#idBlockIds').on('change, keyup', function() {
        var currentInput = $(this).val();
        var fixedInput = currentInput.replace(/[A-Za-z!@#$%^&*()]/g, '');
        $(this).val(fixedInput);        
    });
}

function selectParidadesBehavior(){    
    var elementParidadeParent = $("#idDivParidadesSelect")
    var elementParidadeChildId = elementParidadeParent.children()[0].children[1].children[0]
    
    elementParidadeChildId.addEventListener('click', function (event) {
        if($('#idParidadesTodas').prop("selected")){
            selectAll()
        }
        else{
            $('#idParidadesSelect options').prop("selected", false)
            selectNone()
        }
    });
    
}

function selectAll() {
    $('idParidadesSelect option:not(:disabled)').not(':selected').prop('selected', true);
    $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:not(:checked)').not(':disabled').prop('checked', 'checked');
    var values = $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:checked').not(':disabled').parent().map(function() {
        return $(this).text();
    }).get();
    //TODO
    $('#idParidadesSelect').val(values.join(', '));
    
    for (var option of document.getElementById('idParidadesSelect').options) {
        option.selected = true;
    }
};

function selectNone() {
    $('idParidadesSelect option:selected').not(':disabled').prop('selected', false);
    $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:checked').not(':disabled').prop('checked', '');
    var values = $('.dropdown-content.multiple-select-dropdown input[type="checkbox"]:disabled').parent().text();
    $('input.select-dropdown').val(values);
    
    for (var option of document.getElementById('idParidadesSelect').options) {
        option.selected = false;
    }
};


function changeBodyItem(_item){
    hideAllDivs();
    postTradesFromAllPages();
    switch(_item){
        case "ACCESS":
            showAccessDiv();
            break;
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
            getHistoryData();
            showHistoricoDiv();
            break;
        case "TOP TRADERS":
            getTradesAsync();
            showTopTradersDiv();
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

function setParidadesOptions(){
    var sel = document.getElementById('idParidadesSelect'); 
    var idParidades = { 
        "TODAS":0,
        "AUD/USD":1,
        "AUD/CAD":2,
        "AUD/JPY":3,
        "AUD/CHF":4,
        "AUD/NZD":5,
        "CAD/CHF":6,
        "EUR/AUD":7,
        "EUR/CAD":8,
        "EUR/GBP":9,
        "EUR/JPY":10,
        "EUR/USD":11,
        "EUR/NZD":12,
        "GBP/AUD":13,
        "GBP/CAD":14,
        "GBP/CHF":15,
        "GBP/JPY":16,
        "GBP/USD":17,
        "GBP/NZD":18,
        "USD/CAD":19,
        "USD/CHF":20,
        "USD/JPY":21,
        "NZD/USD":22,
        "USD/NOK":23
    }
    $.each(idParidades, function(index, item){
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(index));
        //opt.setAttribute("data-icon","./images/countries/"+index+".png")
        opt.value = index;
        if(index == "TODAS"){
            opt.id = "idParidadesTodas"
        }
        sel.appendChild(opt); 
    });
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

function applyMasks(){
    $('.money').maskMoney({prefix:'R$ ', allowNegative: false, thousands:'.', decimal:',', affixesStay: true});
}

function applyDefaultValueOnBlur(){
    $('#idFollowRank').on("blur", function(){
        if(document.getElementById('radioFollowRank').checked || document.getElementById('radioFollowAmbos').checked){
            if($('#idFollowRank').val()==0){
                $('#idFollowRank').val(1)
                $('#idFollowRankLabel').addClass("active")   
            }
        }
    });

    $('#idValorEntrada').on("blur", function(){
        if($('#idValorEntrada').maskMoney('unmasked')[0] < 2.00){
            $('#idValorEntrada').val("R$ 2,00")
        }
    });

    $('#idValorStopWin').on("blur", function(){
        if($('#idValorStopWin').maskMoney('unmasked')[0] < 2.00){
            $('#idValorStopWin').val("R$ 2,00")
        }
    });

    $('#idValorStopLoss').on("blur", function(){
        if($('#idValorStopLoss').maskMoney('unmasked')[0] < 2.00){
            $('#idValorStopLoss').val("R$ 2,00")
        }
    });

    $('#idValorMinimoTrader').on("blur", function(){
        if($('#idValorMinimoTrader').maskMoney('unmasked')[0] < 2.00){
            $('#idValorMinimoTrader').val("R$ 2,00")
        }
    });

    $('#idQtdMartingale').on("blur", function(){
        if(document.getElementById('radioMartingale').checked){
            if($('#idQtdMartingale').val() < 1){
                $('#idQtdMartingale').val(1)
                $('#idQtdMartingaleLabel').addClass("active")   
            }
        }
    });
}

function applyDefaultValues(){
    if(document.getElementById('radioFollowRank').checked || document.getElementById('radioFollowAmbos').checked){
        if($('#idFollowRank').val()==0){
            $('#idFollowRank').val(1)
            $('#idFollowRankLabel').addClass("active")   
        }
    }
    if($('#idValorEntrada').maskMoney('unmasked')[0] < 2.00){
        $('#idValorEntrada').val("R$ 2,00")
        $('#idValorEntradaLabel').addClass("active") 
    }

    if($('#idValorStopWin').maskMoney('unmasked')[0] < 2.00){
        $('#idValorStopWin').val("R$ 2,00")
        $('#idValorStopWinLabel').addClass("active") 
    }

    if($('#idValorStopLoss').maskMoney('unmasked')[0] < 2.00){
        $('#idValorStopLoss').val("R$ 2,00")
        $('#idValorStopLossLabel').addClass("active") 
    }

    if($('#idValorMinimoTrader').maskMoney('unmasked')[0] < 2.00){
        $('#idValorMinimoTrader').val("R$ 2,00")
        $('#idValorMinimoTraderLabel').addClass("active") 
    }

    if(document.getElementById('radioMartingale').checked){
        if($('#idQtdMartingale').val() < 1){
            $('#idQtdMartingale').val(1)
            $('#idQtdMartingaleLabel').addClass("active")   
        }
    }
}

function setOptionsClick(){
    var radioFollowRank = document.querySelector('#radioFollowRank');
    var radioFollowId = document.querySelector('#radioFollowId');
    var radioFollowAmbos = document.querySelector('#radioFollowAmbos');
    var radioMartingale = document.querySelector('#radioMartingale');
    var radioMaofixa = document.querySelector('#radioMaofixa');

    radioFollowRank.addEventListener('click', function (event) {
        setInputsValuesAfterClick()
    });
    radioFollowId.addEventListener('click', function (event) {
        setInputsValuesAfterClick()
    });
    radioFollowAmbos.addEventListener('click', function (event) {
        setInputsValuesAfterClick()
    });
    radioMartingale.addEventListener('click', function (event) {
        setInputsValuesAfterClick()
    });
    radioMaofixa.addEventListener('click', function (event) {
        setInputsValuesAfterClick()
    });
}

function setInputsValuesAfterClick(){
    if(document.getElementById('radioFollowRank').checked || document.getElementById('radioFollowAmbos').checked){
        if($('#idFollowRank').val()==0){
            $('#idFollowRank').val(1)
            $('#idFollowRankLabel').addClass("active")   
        }
    }
    if(document.getElementById('radioFollowId').checked){
        $('#idFollowRank').val("")
        $('#idFollowRankLabel').removeClass("active")   
    }
    if(document.getElementById('radioMartingale').checked){
        if($('#idQtdMartingale').val()==0){
            $('#idQtdMartingale').val(1)
            $('#idQtdMartingaleLabel').addClass("active")   
        }
    }
    if(document.getElementById('radioMaofixa').checked){
        $('#idQtdMartingale').val(0)
        $('#idQtdMartingaleLabel').addClass("active")   
    }
}

function getRadioVal(form, name) {
    var val;
    var radios = form.elements[name];

    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) {
            val = radios[i].value;
            break;
        }
    }
    return val;
}

function endMainIfPackageError(){
    const options = {
        title: 'Erro',
        type: 'error',
        buttons: [],        
        message: 'Ocorreu um erro durante o processo de instalação dos pacotes necessários.',
        detail: 'Por favor, entre em contato com o suporte.',
        cancelId: 0
    };
    if(dialog.showMessageBoxSync(null, options) == 0){
        let w = remote.getCurrentWindow()
        w.close()
    }
}

window.onload = function() {
    if(isFirstAccess()){
        document.getElementById("idDivFirstAccessMessage").innerHTML= "Configurando primeiro acesso..."
        showRowFirstAccess()
        callInstaller().then(() => {
            if(isInstalled()){
                initBehavior();
                initBusiness();
                hideRowFirstAccess()
                showRowAccess();
            }else{
                endMainIfPackageError()
            }
        });
    }else{
        document.getElementById("idDivFirstAccessMessage").innerHTML= "Inicializando..."
        if(isInstalled()){
            setTimeout(() => {
                initBehavior();
                initBusiness();
                hideRowFirstAccess();
                showRowAccess();
            }, 1000);
        }else{
            document.getElementById("idDivFirstAccessMessage").innerHTML= "Configurando primeiro acesso..."
            showRowFirstAccess()
            callInstaller().then(() => {
                if(isInstalled()){
                    initBehavior();
                    initBusiness();
                    hideRowFirstAccess()
                    showRowAccess();
                }else{
                    endMainIfPackageError()
                }
            });
        }
    }
};