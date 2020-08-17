# -*- coding: utf-8 -*-
import sys
import json, configparser, time
from api import start
from utils import Utils
from datetime import datetime, date, timedelta
from dateutil import tz, rrule
import threading
from iqoptionapi.expiration import get_expiration_time
import asyncio
from config import startConfig

logging, handler = Utils.setup_logger('copylogger', 'atividades.log', 'w')
loggingHistory, handlerHistory = Utils.setup_logger('historylogger', 'resultados.log.config', 'a')

api = start()
iqoption = api.getApi()
check, reason = iqoption.connect()

config = startConfig().getConfig()


def logActivities(isHeader, msg):
    if isHeader:
        logging.info('<blockquote class="blockquote-custom-header">{}</blockquote>'.format(str(msg).upper()))
    else:
        logging.info('<blockquote class="blockquote-custom-body">{}</blockquote>'.format(msg))
    handler.flush()


def checkConditions(_userId, _valorEntrada):
    isValido = False
    if config.getTipoFollow() != "followNenhum" and _userId in config.getTradersToFollow() and _valorEntrada >= config.getValorMinimoTrader():
        isValido = True 
    elif config.getTipoFollow() == "followNenhum" and _valorEntrada >= config.getValorMinimoTrader():
        isValido = True
    return isValido

def logHistorico(id, resultado, paridade, valor, operacao, nome, timeframe, data):
    ok = True
    while ok:
        try:
            myfile = open("resultados.log.config", "a+")
            ok = False
        except IOError:
            ok = True
    with myfile:
        historicoJson = {'message':'','id': id, 'resultado': resultado.upper(), 'paridade': paridade.upper(), 'valor': valor, 'operacao': operacao.upper(), 'nome': nome, 'timeframe': timeframe, 'data': timestamp_converter(data)}
        python2json = json.dumps(historicoJson)
        loggingHistory.info(python2json + ",")
        handlerHistory.flush()
        myfile.close()

def timestamp_converter(x, retorno = 1):
	hora = datetime.strptime(datetime.utcfromtimestamp(x).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S')
	hora = hora.replace(tzinfo=tz.gettz('GMT'))
	return str(hora.astimezone(tz.gettz('America/Sao Paulo')))[:-6] if retorno == 1 else hora.astimezone(tz.gettz('America/Sao Paulo'))

def filtro_ranking():
    user_id = []
    filtro_top_traders = config.getFollowRank()
    ranking = iqoption.get_leader_board('Worldwide', 1, filtro_top_traders, 0)
    if int(filtro_top_traders) != 0:
        for n in ranking['result']['positional']:
            id = ranking['result']['positional'][n]['user_id']
            user_id.append(id)
    return user_id

def appendIdToFollow():
    seguir_ids = config.getFollowId().replace(" ", "")
    if seguir_ids != '':
        if ',' in seguir_ids:
            x = seguir_ids.split(',')
            for old in x:
                config.getTradersToFollow().append(int(old))
        else:
            config.getTradersToFollow().append(int(seguir_ids))

def getValorEntradaCalculada():
    valEntrada = 2
    if config.getTipoGerenciamento() == 'maofixa':
        valEntrada = config.getValorEntrada()
    else:
        if config.getQtdMartingaleAtual() == 0:
            valEntrada = config.getValorEntrada()
        else:
            valEntrada = config.getValorEntradaAnterior() * 2
    return round(float(valEntrada),2)

def setVariaveisMartingale(status):
    if config.getTipoGerenciamento() == 'martingale':
        if status == 'win' or config.getQtdMartingales() == config.getQtdMartingaleAtual():
            config.setQtdMartingaleAtual(0)
        else:
            config.setQtdMartingaleAtual(config.getQtdMartingaleAtual() + 1)

def calculaSaldoAtual(valorResultado):
    config.setSaldoAtual(config.getSaldoAtual() + round(float(valorResultado),2))

if check == False:
    userData = {'message': 'error','name': '', 'currency':'', 'balance': '', 'avatar': ''}
    python2json = json.dumps(userData)
    print(python2json)
else:
    result = iqoption.get_profile_ansyc()
    ###############################################
    # ETAPA 1
    ###############################################
    logActivities(True, "Conectando na sua conta:")

    if config.getTipoConta() == 'REAL':
        iqoption.change_balance("REAL")
    else:
        iqoption.change_balance("PRACTICE")

    userData = {'message': '','name': result["first_name"], 'currency': result["currency"], 'balance': iqoption.get_balance(), 'avatar': result["avatar"]}
    python2json = json.dumps(userData)
    print(python2json)

    logActivities(False, "Conectado com sucesso em sua conta <b>{}</b>".format('REAL' if str(config.getTipoConta().upper())=='REAL' else 'de TREINAMENTO'))
    ###############################################
    # ETAPA 2
    ###############################################
    logActivities(True, "Montando lista de ids dos traders que você está seguindo:")

    if config.getTipoFollow() == 'followRank' or config.getTipoFollow() == 'followAmbos':
        config.setTradersToFollow(filtro_ranking())
    # Monta lista de IDs dos traders que serão seguidos
    if config.getTipoFollow() == 'followId' or config.getTipoFollow() == 'followAmbos':
        appendIdToFollow()

    #logActivities(False, str(config.getTradersToFollow()).replace("[","").replace("]","").replace("'",""))
    logActivities(False, "Você selecionou um total de <b>{}</b> traders".format(len(config.getTradersToFollow())))
    ###############################################
    # ETAPA 3
    ###############################################
    # logActivities(True, "Montando lista de ids dos traders que você está evitando:")

    # blacklist_ids = ''
    # filtro_black_list = []
    # # # Monta lista de IDs dos traders que estão errando muito (dias ruins pra todos)
    # if blacklist_ids != '':
    #     if ',' in blacklist_ids:
    #         x = blacklist_ids.split(',')
    #         for old in x:
    #             filtro_black_list.append(int(old))
    #     else:
    #         filtro_black_list.append(int(blacklist_ids))

    # logActivities(False, "Você não está evitando nenhum trader" if blacklist_ids == '' else str(filtro_black_list).replace("[","").replace("]","").replace("'",""))
    ###############################################
    # ETAPA 4
    ###############################################
    if config.getTipoOpcoes() == 'binarias' or config.getTipoOpcoes() == 'opcoesAmbas':
        logActivities(True, "Buscando ativos que estão abertos na plataforma (BINÁRIAS):")
        config.setAtivosAbertosBinarias(Utils.buscaAtivosAbertos(iqoption, 'B'))
        logActivities(False, str(config.getAtivosAbertosBinarias()).replace("[","").replace("]","").replace("'",""))
    ###############################################
    # ETAPA 5
    ###############################################
    if config.getTipoOpcoes() == 'digitais' or config.getTipoOpcoes() == 'opcoesAmbas':
        logActivities(True, "Buscando ativos que estão abertos na plataforma (DIGITAIS):")
        config.setAtivosAbertosDigitais(Utils.buscaAtivosAbertos(iqoption, 'D'))
        logActivities(False, str(config.getAtivosAbertosDigitais()).replace("[","").replace("]","").replace("'",""))
        ###############################################
        # ETAPA 5.2
        ###############################################
        logActivities(True, "Inicializando o(s) timeframes que você selecionou para operar (DIGITAIS):")
        timeFrames=''
        if config.getTipoExpiracao() == 'um':
            timeFrames = '1 Minuto'
        elif config.getTipoExpiracao() == 'cinco':
            timeFrames = '5 Minutos'
        elif config.getTipoExpiracao() == 'expiracaoAmbos':
            timeFrames = '1 Minuto e 5 Minutos'
        # Inicializa timeframes PT1M / PT5M / PT15M
        logActivities(False, timeFrames)
    ###############################################
    # ETAPA 6
    ###############################################
    logActivities(True, "Aplicando o Stop Win e Stop Loss que você informou:")
    logActivities(False, "Valor informado para stop <b>WIN: R$ {}</b><br>Valor informado para stop <b>LOSS: R$ {}</b>".format(str(config.getValorStopWin()),str(config.getValorStopLoss())))
    ###############################################
    # ETAPA 7
    ###############################################
    logActivities(True, "Preparando-se para encontrar entradas com valor igual ou superior ao informado:")
    logActivities(False, "Apenas entradas de valor igual ou maior que <b> R$ {}</b> serão levadas em consideração".format(config.getValorMinimoTrader()))
    ###############################################
    # ETAPA 8
    ###############################################

    config.setValorEntradaAtual(config.getValorEntrada())
    config.setValorEntradaAnterior(config.getValorEntrada())
    logActivities(True, "Iniciando cópia:")
    logActivities(False, "Buscando operações...")

    def getLiveDealBinarySync():
        old = 0
        now = datetime.now() #Hora atual rsrs
        refreshTime =  now + timedelta(hours=1) #Intervalo de tempo entre as verificações dos ativos abertos
        refreshRank =  now + timedelta(minutes=10) #Intervalo de tempo entre as verificações dos ativos abertos

        #Atualiza a lista de ativos que estão abertos (ocorre a cada 1h)
        if refreshTime < now:
            refreshTime =  now + timedelta(hours=1)
            config.getAtivosAbertosBinarias().clear()
            config.setAtivosAbertosBinarias(Utils.buscaAtivosAbertos(iqoption, 'B'))
        #Atualiza a lista de top traders que serão copiadas as entradas (ocorre a cada 10 minutos)
        if refreshRank < now:
            if config.getTipoFollow() == 'followRank' or config.getTipoFollow() == 'followAmbos':
                config.getTradersToFollow().clear()
                config.setTradersToFollow(filtro_ranking())
            if config.getTipoFollow() == 'followId' or config.getTipoFollow() == 'followAmbos':
                appendIdToFollow()

        for paridade in config.getAtivosAbertosBinarias():
            iqoption.unscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo')
            iqoption.subscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo', 10)
            trades = iqoption.get_live_deal("live-deal-binary-option-placed", paridade, 'turbo')
            #logActivities(True, 'TRUE' if old != int(trades[0]['user_id']) else 'FALSE')
            if len(trades) > 0:
                user_id = trades[0]['user_id']
                name = trades[0]['name']
                direction = trades[0]['direction']
                created = trades[0]['created_at']
                expiration = trades[0]['expiration']
                amount_enrolled = round(float(trades[0]['amount_enrolled']),2)

                #if user_id in config.getTradersToFollow():
                if amount_enrolled >= config.getValorMinimoTrader():
                    #if old != int(new):
                    res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                    expiration_calc = Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))
                    if res <= float(15):
                        status, id = iqoption.buy(config.getValorEntradaAtual(), paridade, direction, expiration_calc)
                        if status:
                            # if id != old:
                            #     old = id
                            lucro = iqoption.check_win_v3(id)
                            calculaSaldoAtual(lucro)
                            logActivities(True, "A operação <b>{}</b> realizada nas opções <b>BINÁRIAS</b> foi finalizada:".format(id))
                            logActivities(False, "Resultado: <b>{}</b><br>Saldo: <b>{}</b><br>Lucro/Prejuizo: <b>{}</b>".format("WIN" if lucro > 0 else "LOSS", config.getSaldoAtual(),round(float(lucro),2)))
                            logHistorico(user_id, "WIN" if lucro > 0 else "LOSS", paridade, round(float(lucro),2), direction, name, "PT{}M".format(expiration_calc), int(str(expiration)[0:10]))
                            if config.getSaldoAtual() >= config.getValorStopWin() or (config.getSaldoAtual()*-1) >= config.getValorStopLoss():
                                sys.exit()
                            if lucro > 0:
                                setVariaveisMartingale('win')
                                config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                config.setValorEntradaAtual(getValorEntradaCalculada())
                            else:
                                setVariaveisMartingale('loss')
                                config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                config.setValorEntradaAtual(getValorEntradaCalculada())

    def getLiveDealDigitalSync(timeFrame):
        old = 0
        now = datetime.now() #Hora atual rsrs
        refreshTime =  now + timedelta(hours=1) #Intervalo de tempo entre as verificações dos ativos abertos
        refreshRank =  now + timedelta(minutes=10) #Intervalo de tempo entre as verificações dos ativos abertos
        if refreshTime < now:
            refreshTime =  now + timedelta(hours=1)
            config.getAtivosAbertosBinarias().clear()
            config.setAtivosAbertosBinarias(Utils.buscaAtivosAbertos(iqoption, 'B'))
        #Atualiza a lista de top traders que serão copiadas as entradas (ocorre a cada 10 minutos)
        if refreshRank < now:
            if config.getTipoFollow() == 'followRank' or config.getTipoFollow() == 'followAmbos':
                config.getTradersToFollow().clear()
                config.setTradersToFollow(filtro_ranking())
            if config.getTipoFollow() == 'followId' or config.getTipoFollow() == 'followAmbos':
                appendIdToFollow()

        for paridade in config.getAtivosAbertosDigitais():
            iqoption.unscribe_live_deal('live-deal-digital-option', paridade, timeFrame)
            iqoption.subscribe_live_deal('live-deal-digital-option', paridade, timeFrame, 10)
            trades = iqoption.get_live_deal('live-deal-digital-option', paridade, timeFrame)
            if len(trades) > 0:
                user_id = trades[0]['user_id']
                name = trades[0]['name']
                direction = trades[0]['instrument_dir']
                created = trades[0]['created_at']
                expiration = trades[0]['expiration_type'].replace("PT", "").replace("M","")
                amount_enrolled = round(float(trades[0]['amount_enrolled']),2)
                #if user_id in config.getTradersToFollow():
                if amount_enrolled >= config.getValorMinimoTrader():
                    res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                    if res <= float(15):
                        statusBuy, id = iqoption.buy_digital_spot(paridade, config.getValorEntradaAtual(), direction, int(expiration))
                        if statusBuy:
                            # if id != old:
                            #     old = id
                            status, lucro = Utils.check_win_digital_v3(iqoption, id)
                            if status:
                                calculaSaldoAtual(lucro)
                                logActivities(True, "A operação <b>{}</b> realizada nas opções <b>DIGITAIS</b> foi finalizada:".format(id))
                                logActivities(False, "Resultado: <b>{}</b><br>Saldo: <b>{}</b><br>Lucro/Prejuizo: <b>{}</b>".format("WIN" if lucro > 0 else "LOSS", config.getSaldoAtual(),round(float(lucro),2)))
                                logHistorico(user_id, "WIN" if lucro > 0 else "LOSS", paridade, round(float(lucro),2), direction, name, "PT{}M".format(expiration), int(str(created)[0:10]))
                                if config.getSaldoAtual() >= config.getValorStopWin() or (config.getSaldoAtual()*-1) >= config.getValorStopLoss():
                                    sys.exit()
                                if lucro > 0:
                                    setVariaveisMartingale('win')
                                    config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                    config.setValorEntradaAtual(getValorEntradaCalculada())
                                else:
                                    setVariaveisMartingale('loss')
                                    config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                    config.setValorEntradaAtual(getValorEntradaCalculada())

    def getLiveDealBinaryAsync():
        old = 0
        now = datetime.now() #Hora atual rsrs
        refreshTime =  now + timedelta(hours=1) #Intervalo de tempo entre as verificações dos ativos abertos
        refreshRank =  now + timedelta(minutes=10) #Intervalo de tempo entre as verificações dos ativos abertos
        while True:
            #Atualiza a lista de ativos que estão abertos (ocorre a cada 1h)
            if refreshTime < now:
                refreshTime =  now + timedelta(hours=1)
                config.getAtivosAbertosBinarias().clear()
                config.setAtivosAbertosBinarias(Utils.buscaAtivosAbertos(iqoption, 'B'))
            #Atualiza a lista de top traders que serão copiadas as entradas (ocorre a cada 10 minutos)
            if refreshRank < now:
                if config.getTipoFollow() == 'followRank' or config.getTipoFollow() == 'followAmbos':
                    config.getTradersToFollow().clear()
                    config.setTradersToFollow(filtro_ranking())
                if config.getTipoFollow() == 'followId' or config.getTipoFollow() == 'followAmbos':
                    appendIdToFollow()

            for paridade in config.getAtivosAbertosBinarias():
                iqoption.unscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo')
                iqoption.subscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo', 10)
                trades = iqoption.get_live_deal("live-deal-binary-option-placed", paridade, 'turbo')
                if len(trades) > 0:
                    res = 0
                    created = trades[0]['created_at']
                    # print(timestamp_converter(time.time() / 1000, 2))
                    # print(timestamp_converter(created / 1000, 2))
                    #res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                    res = Utils.getDifferenceInSeconds(int(str(time.time())[0:10]), int(str(created)[0:10]))
                    if res <= float(3): 
                        user_id = trades[0]['user_id']
                        name = trades[0]['name']
                        direction = trades[0]['direction']
                        #created = trades[0]['created_at']
                        expiration = trades[0]['expiration']
                        amount_enrolled = round(float(trades[0]['amount_enrolled']),2)
                        #if user_id in config.getTradersToFollow():
                        #if amount_enrolled >= config.getValorMinimoTrader():
                        if checkConditions(user_id, amount_enrolled):
                            expiration_calc = Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))
                            status, id = iqoption.buy(config.getValorEntradaAtual(), paridade, direction, 1)
                            if status:
                                lucro = iqoption.check_win_v3(id)
                                calculaSaldoAtual(lucro)
                                logActivities(True, "A operação <b>{}</b> realizada nas opções <b>BINÁRIAS</b> foi finalizada:".format(id))
                                logActivities(False, "Resultado: <b>{}</b><br>Saldo: <b>{}</b><br>Lucro/Prejuizo: <b>{}</b>".format("WIN" if lucro > 0 else "LOSS", config.getSaldoAtual(),round(float(lucro),2)))
                                logHistorico(user_id, "WIN" if lucro > 0 else "LOSS", paridade, round(float(amount_enrolled),2), direction, name, "PT{}M".format(expiration_calc), int(str(expiration)[0:10]))
                                if config.getSaldoAtual() >= config.getValorStopWin() or (config.getSaldoAtual()*-1) >= config.getValorStopLoss():
                                    sys.exit()
                                if lucro > 0:
                                    setVariaveisMartingale('win')
                                    config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                    config.setValorEntradaAtual(getValorEntradaCalculada())
                                else:
                                    setVariaveisMartingale('loss')
                                    config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                    config.setValorEntradaAtual(getValorEntradaCalculada())
                    iqoption.pop_live_deal("live-deal-binary-option-placed", paridade, "turbo")

    def getLiveDealDigitalAsync(timeFrame):
        old = 0
        now = datetime.now() #Hora atual rsrs
        refreshTime =  now + timedelta(hours=1) #Intervalo de tempo entre as verificações dos ativos abertos
        refreshRank =  now + timedelta(minutes=10) #Intervalo de tempo entre as verificações dos ativos abertos
        while True:
            if refreshTime < now:
                refreshTime =  now + timedelta(hours=1)
                config.getAtivosAbertosBinarias().clear()
                config.setAtivosAbertosBinarias(Utils.buscaAtivosAbertos(iqoption, 'B'))
            #Atualiza a lista de top traders que serão copiadas as entradas (ocorre a cada 10 minutos)
            if config.getTipoFollow() != "followNenhum":
                if refreshRank < now:
                    if config.getTipoFollow() == 'followRank' or config.getTipoFollow() == 'followAmbos':
                        config.getTradersToFollow().clear()
                        config.setTradersToFollow(filtro_ranking())
                    if config.getTipoFollow() == 'followId' or config.getTipoFollow() == 'followAmbos':
                        appendIdToFollow()

            for paridade in config.getAtivosAbertosDigitais():
                iqoption.unscribe_live_deal('live-deal-digital-option', paridade, timeFrame)
                iqoption.subscribe_live_deal('live-deal-digital-option', paridade, timeFrame, 10)
                trades = iqoption.get_live_deal('live-deal-digital-option', paridade, timeFrame)
                if len(trades) > 0:
                    res = 0
                    created = trades[0]['created_at']
                    # print(timestamp_converter(time.time() / 1000, 2))
                    # print(timestamp_converter(created / 1000, 2))
                    #res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                    res = Utils.getDifferenceInSeconds(int(str(time.time())[0:10]), int(str(created)[0:10]))
                    if res <= float(3):    
                        user_id = trades[0]['user_id']
                        name = trades[0]['name']
                        direction = trades[0]['instrument_dir']
                        expiration = trades[0]['expiration_type'].replace("PT", "").replace("M","")
                        amount_enrolled = round(float(trades[0]['amount_enrolled']),2)
                        if checkConditions(user_id, amount_enrolled):
                            statusBuy, id = iqoption.buy_digital_spot(paridade, config.getValorEntradaAtual(), direction, int(1))
                            if statusBuy:
                                status, lucro = Utils.check_win_digital_v3(iqoption, id)
                                if status:
                                    calculaSaldoAtual(lucro)
                                    logActivities(True, "A operação <b>{}</b> realizada nas opções <b>DIGITAIS</b> foi finalizada:".format(id))
                                    logActivities(False, "Resultado: <b>{}</b><br>Saldo: <b>{}</b><br>Lucro/Prejuizo: <b>{}</b>".format("WIN" if lucro > 0 else "LOSS", config.getSaldoAtual(),round(float(lucro),2)))
                                    logHistorico(user_id, "WIN" if lucro > 0 else "LOSS", paridade, round(float(amount_enrolled),2), direction, name, "PT{}M".format(expiration), int(str(created)[0:10]))
                                    if config.getSaldoAtual() >= config.getValorStopWin() or (config.getSaldoAtual()*-1) >= config.getValorStopLoss():
                                        sys.exit()
                                    if lucro > 0:
                                        setVariaveisMartingale('win')
                                        config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                        config.setValorEntradaAtual(getValorEntradaCalculada())
                                    else:
                                        setVariaveisMartingale('loss')
                                        config.setValorEntradaAnterior(config.getValorEntradaAtual())
                                        config.setValorEntradaAtual(getValorEntradaCalculada())
                    iqoption.pop_live_deal('live-deal-digital-option', paridade, timeFrame)

    def callTradesAsync():
        if config.getTipoOpcoes() == 'binarias' or config.getTipoOpcoes() == 'opcoesAmbas':
            threading.Thread(target=getLiveDealBinaryAsync).start()
        if config.getTipoOpcoes() == 'digitais' or config.getTipoOpcoes() == 'opcoesAmbas':
            if config.getTipoExpiracao() == 'um' or config.getTipoExpiracao() == 'expiracaoAmbos':
                threading.Thread(target=getLiveDealDigitalAsync, args=["PT1M"]).start()
            if config.getTipoExpiracao() == 'cinco' or config.getTipoExpiracao() == 'expiracaoAmbos':
                threading.Thread(target=getLiveDealDigitalAsync, args=["PT5M"]).start()

    def callTradesSync():
        while True:
            if config.getTipoOpcoes() == 'binarias' or config.getTipoOpcoes() == 'opcoesAmbas':
                getLiveDealBinarySync()
            if config.getTipoOpcoes() == 'digitais' or config.getTipoOpcoes() == 'opcoesAmbas':
                if config.getTipoExpiracao() == 'um' or config.getTipoExpiracao() == 'expiracaoAmbos':
                    getLiveDealDigitalSync("PT1M")
                if config.getTipoExpiracao() == 'cinco' or config.getTipoExpiracao() == 'expiracaoAmbos':
                    getLiveDealDigitalSync("PT5M")

    if config.getTipoGerenciamento() == 'maofixa':
        callTradesAsync()
    elif config.getTipoGerenciamento() == 'martingale':
        threading.Thread(target=callTradesSync).start()


