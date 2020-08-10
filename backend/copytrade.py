# -*- coding: utf-8 -*-  
import sys
import json, configparser, logging, time
from api import start
from utils import Utils
from datetime import datetime, date, timedelta
from dateutil import tz, rrule
import threading
from iqoptionapi.expiration import get_expiration_time
import asyncio
from config import startConfig

logging, handler = Utils.setup_logger('copylogger', 'atividades.log')

api = start()
iqoption = api.getApi()
check, reason = iqoption.connect()

config = startConfig().getConfig()

#real = sys.argv[1]
real = 'treinamento'

def timestamp_converter(x, retorno = 1):
	hora = datetime.strptime(datetime.utcfromtimestamp(x).strftime('%Y-%m-%d %H:%M:%S'), '%Y-%m-%d %H:%M:%S')
	hora = hora.replace(tzinfo=tz.gettz('GMT'))
	
	return str(hora.astimezone(tz.gettz('America/Sao Paulo')))[:-6] if retorno == 1 else hora.astimezone(tz.gettz('America/Sao Paulo'))

def logActivities(isHeader, msg):
    if isHeader:
        logging.info('<blockquote class="blockquote-custom-header">{}</blockquote>'.format(str(msg).upper()))
    else:
        logging.info('<blockquote class="blockquote-custom-body">{}</blockquote>'.format(msg))
    handler.flush()

def filtro_ranking():
    user_id = []
    filtro_top_traders = config.getFollowRank()

    ranking = iqoption.get_leader_board('Worldwide', 1, filtro_top_traders, 0)
    if int(filtro_top_traders) != 0:
        for n in ranking['result']['positional']:
            id = ranking['result']['positional'][n]['user_id']
            user_id.append(id)
    return user_id

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
    #print(reason)
    result = iqoption.get_profile_ansyc()
    ###############################################
    # ETAPA 1
    ###############################################
    logActivities(True, "Conectando na sua conta:")

    if real == 'REAL':
        iqoption.change_balance("REAL")
    else:
        iqoption.change_balance("PRACTICE")

    userData = {'message': '','name': result["first_name"], 'currency': result["currency"], 'balance': iqoption.get_balance(), 'avatar': result["avatar"]}
    python2json = json.dumps(userData)
    print(python2json)

    logActivities(False, "Conectado com sucesso em sua conta {}".format('REAL' if str(real)=='REAL' else 'de TREINAMENTO'))
    ###############################################
    # ETAPA 2
    ###############################################
    logActivities(True, "Montando lista de ids dos traders que você está seguindo:")

    if config.getTipoFollow() == 'followRank' or config.getTipoFollow() == 'followAmbos':
        filtro_top_traders = filtro_ranking()
    else:
        filtro_top_traders = []

    # Monta lista de IDs dos traders que serão seguidos (FUNCIONALIDADE AINDA EM BETA)
    if config.getTipoFollow() == 'followId' or config.getTipoFollow() == 'followAmbos':
        seguir_ids = config.getFollowId().replace(" ", "")
        if seguir_ids != '':
            if ',' in seguir_ids:
                x = seguir_ids.split(',')
                for old in x:
                    filtro_top_traders.append(int(old))
            else:
                filtro_top_traders.append(int(seguir_ids))

    logActivities(False, str(filtro_top_traders).replace("[","").replace("]","").replace("'",""))
    ###############################################
    # ETAPA 3
    ###############################################
    logActivities(True, "Montando lista de ids dos traders que você está evitando:")

    blacklist_ids = ''
    filtro_black_list = []
    # # Monta lista de IDs dos traders que estão errando muito (dias ruins pra todos)
    if blacklist_ids != '':
        if ',' in blacklist_ids:
            x = blacklist_ids.split(',')
            for old in x:
                filtro_black_list.append(int(old))
        else:
            filtro_black_list.append(int(blacklist_ids))

    logActivities(False, "Você não está evitando nenhum trader" if blacklist_ids == '' else str(filtro_black_list).replace("[","").replace("]","").replace("'",""))
    ###############################################
    # ETAPA 4
    ###############################################
    if config.getTipoOpcoes() == 'binarias' or config.getTipoOpcoes() == 'opcoesAmbas':
        logActivities(True, "Buscando ativos que estão abertos na plataforma (BINÁRIAS):")
        #Inicializa os ativos abertos
        ativosAbertosBinarias = []
        ativosAbertosBinarias = Utils.buscaAtivosAbertos(iqoption, 'B')
        logActivities(False, str(ativosAbertosBinarias).replace("[","").replace("]","").replace("'",""))
    ###############################################
    # ETAPA 5
    ###############################################
    if config.getTipoOpcoes() == 'digitais' or config.getTipoOpcoes() == 'opcoesAmbas':
        logActivities(True, "Buscando ativos que estão abertos na plataforma (DIGITAIS):")
        ativosAbertosDigitais = []
        ativosAbertosDigitais = Utils.buscaAtivosAbertos(iqoption, 'D')
        logActivities(False, str(ativosAbertosDigitais).replace("[","").replace("]","").replace("'",""))
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

    # Inicializa valores referentes a Ordem
    stopwin = float(500)
    stoploss = float(-150)
    valor_minimo = float(2)
    valor_oper = float(2)
    # Inicializa valores de saldo, win e loss
    valWin = float(0)
    valLoss = float(0)
    saldo = float(0)

    logActivities(False, "stop WIN: {} / stop LOSS: {}".format(str(config.getValorStopWin()),str(config.getValorStopLoss())))
    ###############################################
    # ETAPA 7
    ###############################################

    now = datetime.now() #Hora atual rsrs
    end = now + timedelta(hours=10) #Por quantas horas o  bot ficará rodando
    refreshTime =  now + timedelta(hours=1) #Intervalo de tempo entre as verificações dos ativos abertos
    refreshRank =  now + timedelta(minutes=10) #Intervalo de tempo entre as verificações dos ativos abertos
    refreshPayout = now + timedelta(minutes=30) #Intervalo de tempo entre as verificações do payout dos ativos

    old = 0
    config.setValorEntradaAtual(config.getValorEntrada())
    config.setValorEntradaAnterior(config.getValorEntrada())
    logActivities(True, "Iniciando cópia")
  
    def getLiveDealBinary():
        while True:
            for paridade in ativosAbertosBinarias:
                iqoption.unscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo')
                iqoption.subscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo', 10)
                trades = iqoption.get_live_deal("live-deal-binary-option-placed", paridade, 'turbo')
                #logActivities(True, 'TRUE' if old != int(trades[0]['user_id']) else 'FALSE')
                if len(trades) > 0:
                    new = trades[0]['user_id']
                    direction = trades[0]['direction']
                    created = trades[0]['created_at']
                    expiration = trades[0]['expiration']                   
                    #if old != int(new):
                    #res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                    expiration_calc = Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))
                    #if res <= float(5): 
                        #logActivities(False, '{},{},{}'.format(paridade, str(direction).lower(), Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))))
                    status, id = iqoption.buy(config.getValorEntradaAtual(), paridade, direction, 1)

                    if status:
                        lucro = iqoption.check_win_v3(id)
                        calculaSaldoAtual(lucro)
                        print ('SALDO ATUAL: {}'.format(config.getSaldoAtual()))
                        if config.getSaldoAtual() >= config.getValorStopWin() or (config.getSaldoAtual()*-1) >= config.getValorStopLoss():
                            sys.exit()
                        if lucro > 0:
                            setVariaveisMartingale('win')
                            config.setValorEntradaAnterior(config.getValorEntradaAtual())
                            config.setValorEntradaAtual(getValorEntradaCalculada())
                            #print('Ganhou {}'.format(lucro))
                            print(config.getValorEntradaAtual())
                            print(config.getValorEntradaAnterior())
                            print(config.getQtdMartingaleAtual())
                        else:
                            setVariaveisMartingale('loss')
                            config.setValorEntradaAnterior(config.getValorEntradaAtual())
                            config.setValorEntradaAtual(getValorEntradaCalculada())
                            #print('Perdeu {}'.format(lucro))
                            print(config.getValorEntradaAtual())
                            print(config.getValorEntradaAnterior())
                            print(config.getQtdMartingaleAtual())
                        

    def getLiveDealDigital(timeFrame):
        while True:
            for paridade in ativosAbertosDigitais:
                iqoption.unscribe_live_deal('live-deal-digital-option', paridade, timeFrame)
                iqoption.subscribe_live_deal('live-deal-digital-option', paridade, timeFrame, 10)
                trades = iqoption.get_live_deal('live-deal-digital-option', paridade, timeFrame)
                if len(trades) > 0:
                    new = trades[0]['user_id']
                    direction = trades[0]['instrument_dir']
                    created = trades[0]['created_at']
                    expiration = trades[0]['expiration_type'].replace("PT", "").replace("M","")

                    res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                    id = iqoption.buy_digital_spot(paridade, 2, direction, int(expiration))

                    if isinstance(id, int):
                        while True:
                            status, lucro = iqoption.check_win_digital_v2(id)
                            if status:
                                if lucro > 0:
                                    logActivities(False, '{}'.format('ganhou'))
                                else:
                                    logActivities(False, '{}'.format('perdeu'))
                                    
    if config.getTipoOpcoes() == 'binarias' or config.getTipoOpcoes() == 'opcoesAmbas': 
        threading.Thread(target=getLiveDealBinary).start()
    # if config.getTipoOpcoes() == 'digitais' or config.getTipoOpcoes() == 'opcoesAmbas':            
    #     if config.getTipoExpiracao() == 'um' or config.getTipoExpiracao() == 'expiracaoAmbos':
    #         threading.Thread(target=getLiveDealDigital, args=["PT1M"]).start()
    #     if config.getTipoExpiracao() == 'cinco' or config.getTipoExpiracao() == 'expiracaoAmbos':
    #         threading.Thread(target=getLiveDealDigital, args=["PT5M"]).start()

    
