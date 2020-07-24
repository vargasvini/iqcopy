# -*- coding: utf-8 -*-  
from iqoptionapi.stable_api import IQ_Option
import sys
import time, json, logging, configparser

try:
    file_ = open("copy.config")
except IOError:
    wait_message((u'ERROR: arquivo [{}], n\xe3o encontrado.').format(file_))
    sys.exit()

parser = configparser.ConfigParser()
parser.read("copy.config")
login_conta = parser.get('acesso','login')
senha_conta = parser.get('acesso','senha')


iqoption = IQ_Option(login_conta, senha_conta)
check, reason = iqoption.connect()

real = sys.argv[1]

if check == False:
    userData = {'message': 'error','name': '', 'currency':'', 'balance': '', 'avatar': ''}
    python2json = json.dumps(userData)
    print(python2json)
else:
    #print(reason)
    result = iqoption.get_profile_ansyc()

    if real == 'REAL':
        iqoption.change_balance("REAL")
    else:
        iqoption.change_balance("PRACTICE")


    userData = {'message': '','name': result["first_name"], 'currency': result["currency"], 'balance': iqoption.get_balance(), 'avatar': result["avatar"]}
    python2json = json.dumps(userData)
    print(python2json)
