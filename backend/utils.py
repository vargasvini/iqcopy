from iqoptionapi.expiration import get_expiration_time
from datetime import datetime, date, timedelta
import logging, json, time, csv, sys


###Funções usadas internamentes para compras de ordems (processar_ordem)
def trade_binaria(_iqOption, valor, expiracao, ativo, direcao):
    sucesso, id = _iqOption.buy(valor, ativo.upper(), direcao.lower(), expiracao)
    if not sucesso:
        id = None
    return id

def trade_digital(_iqOption, valor, expiracao, ativo, direcao):
        result, _numero = _iqOption.buy_digital_spot(ativo, valor, direcao.lower(), expiracao)
        # if result == False:
        #     return
        return _numero

def check_trade_digital(_iqOption, numero_ordem, valor, _tempo):
    if numero_ordem == 'error':
        return
    else:
        ans = None
        while True:
            check_close, win_money = _iqOption.check_win_digital_v2(numero_ordem)
            _temp = _tempo - float(_iqOption.get_server_timestamp())
            if _temp >= 0:
                sys.stdout.write((u'\rTempo restante para termino da opera\xe7\xe3o: {}').format(round(_temp / 60, 2)))
                sys.stdout.flush()
            elif check_close:
                if float(win_money) > 0:
                    ans = 'win'
                    break
                else:
                    ans = 'loss'
                    break
            time.sleep(0.5)
    return ans

def check_trade_binaria_v2(_iqOption, numero_ordem, valor, _tempo):
    if numero_ordem == 'error':
        return
    ans = None
    win_money = check_trade_binaria_v3(_iqOption, numero_ordem, _tempo)
    if win_money == 0:
        ans = 'equal'
    else:
        if win_money > 0:
            ans = 'win'
        if win_money < 0:
            ans = 'loss'
    return ans

def check_trade_binaria_v3(_iqOption, id_number, _tempo):
    while True:
        try:
            _temp = _tempo - float(_iqOption.get_server_timestamp())
            if _temp >= 0:
                sys.stdout.write((u'\rTempo restante para termino da opera\xe7\xe3o: {}').format(round(_temp / 60, 2)))
                sys.stdout.flush()
            if _iqOption.get_async_order(id_number)['option-closed'] != {}:
                break
        except:
            pass

    return _iqOption.get_async_order(id_number)['option-closed']['msg']['profit_amount'] - _iqOption.get_async_order(id_number)['option-closed']['msg']['amount']
###=====================================================

class Utils:
    def __init__(self, gale):
        self.gale = True

    
    def processar_ordem(_iqOption, _ativo, _direcao, _valor, _tipo_opcao, expiracao_ordem, exp_bin):
        expiracao_ordem = expiracao_ordem.replace("PT", "").replace("M","")
        expiracao_ordem = int(expiracao_ordem)
        id_number = None
        if _tipo_opcao != 'B':
            id_number = trade_digital(_iqOption, _valor, expiracao_ordem, _ativo, _direcao)
        if _tipo_opcao == 'B':
            id_number = trade_binaria(_iqOption, _valor, exp_bin, _ativo, _direcao)
        if id_number == None:
            logger.error(u'ERRO: N\xe3o pode fazer o trade, problema a corretora. 001')
            return
        #logger.info(' | ---> Nro. ordem: {} - Valor: {} <===='.format(id_number, _valor))
        _expiracao_ordem, _ = get_expiration_time(time.time(), expiracao_ordem)
        
        if _tipo_opcao != 'B':
            win_loss = check_trade_digital(_iqOption, id_number, _valor, _expiracao_ordem)
        else:
            win_loss = check_trade_binaria_v2(_iqOption, id_number, _valor, _expiracao_ordem)

        if win_loss == None:
            logger.error(u'ERRO: N\xe3o pode fazer a checagem, problema na corretora. 002')

        return win_loss

####Funções para consultar valores de payout dos ativos
    def valor_get_payout(_iqOption, ativo, expiracao, _tipo_opcao):
        if _tipo_opcao != 'B':
            return valor_payout_digital(_iqOption, ativo, expiracao)
        return valor_payout_binaria(_iqOption, ativo)

    def valor_payout_binaria(_iqOption, ativo):
        data = _iqOption.get_all_profit()
        time.sleep(0.5)
        return int(100 * data[ativo]['turbo'])

    def valor_payout_digital(_iqOption, ativo, expiracao):
        _iqOption.subscribe_strike_list(ativo, expiracao_ordem)
        while True:
            data = _iqOption.get_digital_current_profit(ativo, expiracao)
            if data != False:
                data = int(data)
                break
            time.sleep(1)
        _iqOption.unsubscribe_strike_list(ativo, expiracao_ordem)
        return data    

    def buscaAtivosAbertos(_iqOption, tipo):
        ativos = _iqOption.get_all_open_time()
        _ativosReturn = []

        #if config.getTipoCopy() == 'live-deal-binary-option-placed':
        if tipo == 'B':
            for item in ativos["turbo"]:
                if ativos["turbo"][str(item)]["open"] == True:
                    _ativosReturn.append(item)      
        else:
            for item in ativos["digital"]:
                if ativos["digital"][str(item)]["open"] == True:
                    _ativosReturn.append(item)  

        #print(_ativosReturn)      
        return _ativosReturn   

    def getDifferenceInMinutes(created, expire):
        date1= datetime.fromtimestamp(created)
        date2 = datetime.fromtimestamp(expire)
        
        time_delta = (date2 - date1)
        total_seconds = time_delta.total_seconds()
        minutes = total_seconds/60
        if minutes < 1:
            minutes = 1

        return int(minutes)
    def getDifferenceInSeconds(now, created):
        date1 = datetime.fromtimestamp(now)
        date2= datetime.fromtimestamp(created)
        
        time_delta = (date1 - date2)
        total_seconds = time_delta.total_seconds()
        # seconds = (total_seconds/60)/60
        # if seconds < 1:
        #     seconds = 1
        return float(total_seconds)

    def getLiveDealDigital(paridade):
        return True

    def setup_logger(name, log_file, logType, level=logging.INFO):
        handler = logging.FileHandler(log_file, logType, 'utf-8')        
        handler.terminator = ""
        logger = logging.getLogger(name)
        logger.setLevel(level)
        logger.addHandler(handler)
    
        return logger, handler

    def check_win_digital_v3(iqoption, buy_order_id):
        while iqoption.get_async_order(buy_order_id)["position-changed"] == {}:
            pass
        order_data = iqoption.get_async_order(buy_order_id)["position-changed"]["msg"]
        if order_data != None:
            while order_data["status"] != "closed":
                order_data = iqoption.get_async_order(buy_order_id)["position-changed"]["msg"]
                if order_data["status"] == "closed":
                    if order_data["close_reason"] == "expired":
                        return True, order_data["close_profit"] - order_data["invest"]
                    elif order_data["close_reason"] == "default":
                        return True, order_data["pnl_realized"]
#####==============================================================#

# if __name__ == '__main__':
#     trade_binaria()
#     trade_digital()