# -*- coding: utf-8 -*-  
import sys
import json, configparser, logging, time
from api import start
from utils import Utils
from datetime import datetime, date, timedelta
from dateutil import tz, rrule
from utils import Utils
import threading
from iqoptionapi.expiration import get_expiration_time
import asyncio

logger = logging.getLogger()
handler = logging.FileHandler('atividades.log', 'w', 'utf-8')
logger.addHandler(handler)
api = start()
iqoption = api.getApi()
check, reason = iqoption.connect()

real = sys.argv[1]


def buyBinary(paridade, direction, created, expiration):
    status, id = iqoption.buy(2, paridade, str(direction).lower(), Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10])))
    time.sleep(2)

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
    filtro_top_traders = 5 #top do rank

    ranking = iqoption.get_leader_board('Worldwide', 1, filtro_top_traders, 0)
    if int(filtro_top_traders) != 0:
        for n in ranking['result']['positional']:
            id = ranking['result']['positional'][n]['user_id']
            user_id.append(id)
            #print(ranking['result']['positional'][n])
    return user_id

def subscribe(paridade):
    #vini
    logActivities(True, paridade)
    iqoption.subscribe_live_deal('live-deal-digital-option', paridade, 'PT1M', 10)
    while True:
        trades = iqoption.get_live_deal("live-deal-digital-option", paridade, 'PT1M')
        if len(trades) > 0 and old != trades[0]['user_id']:
            ok = True
            old = trades[0]['user_id']
            logActivities(True, old)




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

    seguir_ids = '68597057,43750733,22756290'.replace(" ", "")
    #filtro_top_traders = []
    filtro_top_traders = filtro_ranking()
    # Monta lista de IDs dos traders que serão seguidos (FUNCIONALIDADE AINDA EM BETA)
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
    logActivities(True, "Buscando ativos que estão abertos na plataforma:")

    #Inicializa os ativos abertos
    ativosAbertosBinarias = []
    ativosAbertosBinarias = Utils.buscaAtivosAbertos(iqoption, 'B')
    ativosAbertosDigitais = []
    ativosAbertosDigitais = Utils.buscaAtivosAbertos(iqoption, 'D')

    logActivities(False, str(ativosAbertosBinarias).replace("[","").replace("]","").replace("'",""))
    ###############################################
    # ETAPA 5
    ###############################################
    logActivities(True, "Inicializando o(s) timeframes que você selecionou para operar:")

    # Inicializa timeframes PT1M / PT5M / PT15M
    timeFrames = ['PT1M','PT5M','PT15M']
    tf = 0
    timeFrameTeste = "PT1M"

    logActivities(False, timeFrameTeste)
    ###############################################
    # ETAPA 6
    ###############################################
    logActivities(True, "Aplicando o stop win e stop loss que você informou:")

    # Inicializa valores referentes a Ordem
    stopwin = float(500)
    stoploss = float(-150)
    valor_minimo = float(2)
    valor_oper = float(2)
    

    # Inicializa valores de saldo, win e loss
    valWin = float(0)
    valLoss = float(0)
    saldo = float(0)

    logActivities(False, "stop WIN: {} / stop LOSS: {}".format(str(stopwin),str(stoploss)))
    ###############################################
    # ETAPA 7
    ###############################################
    logActivities(True, "Configurando tipo de operações que você escolheu:")

    # Inicializa o tipo de opção default da configuração 
    tipo_opcao = 'live-deal-digital-option'

    logActivities(False, tipo_opcao)
    ###############################################
    # ETAPA 7
    ###############################################

    now = datetime.now() #Hora atual rsrs
    end = now + timedelta(hours=10) #Por quantas horas o  bot ficará rodando
    refreshTime =  now + timedelta(hours=1) #Intervalo de tempo entre as verificações dos ativos abertos
    refreshRank =  now + timedelta(minutes=10) #Intervalo de tempo entre as verificações dos ativos abertos
    refreshPayout = now + timedelta(minutes=30) #Intervalo de tempo entre as verificações do payout dos ativos

    old = 0
    logActivities(True, "Iniciando cópia")

        
    def getLiveDealBinary():
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
                res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                expiration_calc = Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))
                #if res <= float(5): 
                    #logActivities(False, '{},{},{}'.format(paridade, str(direction).lower(), Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))))
                status, id = iqoption.buy(2, "EURUSD", direction, 1)
                logActivities(False, '{},{}'.format(status,id))                        

                if status:
                    while True:
                        try:
                            if iqoption.get_async_order(id)['option-closed'] != {}:
                                break
                        except:
                            pass
                    win_money = iqoption.get_async_order(id)['option-closed']['msg']['profit_amount'] - iqoption.get_async_order(id)['option-closed']['msg']['amount']
                    logActivities(False, '{}'.format(win_money))  

    def getLiveDealBinaryEUR():
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
                res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
                expiration_calc = Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))
                #if res <= float(5): 
                    #logActivities(False, '{},{},{}'.format(paridade, str(direction).lower(), Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))))
                status, id = iqoption.buy(2, "EURJPY", direction, 1)
                logActivities(False, '{},{}'.format(status,id))                        

                if status:
                    while True:
                        try:
                            if iqoption.get_async_order(id)['option-closed'] != {}:
                                break
                        except:
                            pass
                    win_money = iqoption.get_async_order(id)['option-closed']['msg']['profit_amount'] - iqoption.get_async_order(id)['option-closed']['msg']['amount']
                    logActivities(False, '{}'.format(win_money))  
    
    while True:  
        threading.Thread(target=getLiveDealBinary).start()
        #threading.Thread(target=getLiveDealBinaryEUR).start()








        # def getLiveDealBinaryEUR():
        # i = 0    
        # #while i < len(ativosAbertosBinarias):
        #     paridade = ativosAbertosBinarias[i]
        #     iqoption.unscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo')
        #     iqoption.subscribe_live_deal('live-deal-binary-option-placed', paridade, 'turbo', 10)
        #     trades = iqoption.get_live_deal("live-deal-binary-option-placed", paridade, 'turbo')
        #     #logActivities(True, 'TRUE' if old != int(trades[0]['user_id']) else 'FALSE')
        #     if len(trades) > 0:
        #         new = trades[0]['user_id']
        #         direction = trades[0]['direction']
        #         created = trades[0]['created_at']
        #         expiration = trades[0]['expiration']
        #         #if old != int(new):
        #         res = round(time.time() - datetime.timestamp(timestamp_converter(created / 1000, 2)), 2)
        #         expiration_calc = Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))
        #         #if res <= float(5): 
        #             #logActivities(False, '{},{},{}'.format(paridade, str(direction).lower(), Utils.getDifferenceInMinutes(int(str(created)[0:10]), int(str(expiration)[0:10]))))
        #         status, id = iqoption.buy(2, "EURJPY", direction, 1)
        #         logActivities(False, '{},{}'.format(status,id))                        

        #         if status:
        #             while True:
        #                 try:
        #                     if iqoption.get_async_order(id)['option-closed'] != {}:
        #                         break
        #                 except:
        #                     pass
        #             win_money = iqoption.get_async_order(id)['option-closed']['msg']['profit_amount'] - iqoption.get_async_order(id)['option-closed']['msg']['amount']
        #             logActivities(False, '{}'.format(win_money))  

        #     if i < len(ativosAbertosBinarias):
        #         i += 1
        #     elif i == len(ativosAbertosBinarias):
        #         i = 1
