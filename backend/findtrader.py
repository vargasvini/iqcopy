# -*- coding: utf-8 -*-  
import sys
import json, logging
from api import start
from utils import Utils

logging, handler = Utils.setup_logger('finderlogger', 'findtrader.log')

api = start()
iqoption = api.getApi()
check, reason = iqoption.connect()

nome = sys.argv[1]
pais = sys.argv[2]
start = sys.argv[3]

def logFinder(rank, userid, nome, faturamento, pais, img):
    ok = True
    while ok:
        try:
            myfile = open("findtrader.log", "a+")
            ok = False
        except IOError:
            ok = True
    with myfile:
        traderJson = {'message':'','rank': rank, 'userid': userid, 'nome': nome, 'faturamento': faturamento, 'pais': pais, 'img': img}
        python2json = json.dumps(traderJson)
        logging.info(python2json)
        logging.info(",")
        handler.flush()
        myfile.close()

if check == False:
    userData = {'message': 'error','name': '', 'currency':'', 'balance': '', 'avatar': ''}
    python2json = json.dumps(userData)
    print(python2json)
    sys.exit(0)
else:
    if start == "":
        start = "1"
    start = int(start)
    for i in range(1, 1000):
        if start > 1:
            end = int(i) * 500 + start
        else:
            end = int(i) * 500

        data = iqoption.get_leader_board(pais, start, end, 0)

        for colocacao in data['result']['positional']:
            nome_ranking = data['result']['positional'][colocacao]['user_name']
            result_trader = iqoption.get_user_profile_client(data['result']['positional'][colocacao]['user_id'])

            if str(nome).lower().strip() in nome_ranking.lower().strip() or str(nome).lower() in result_trader['user_name'].lower():
                logFinder(str(colocacao), str(data['result']['positional'][colocacao]['user_id']), str(result_trader['user_name']), str(round(data['result']['positional'][colocacao]['score'], 2)), str(data['result']['positional'][colocacao]['flag']), str((result_trader['img_url'] if result_trader['img_url'] != '' else 'Imagem nao disponivel')))
        start = end
    sys.exit(0)