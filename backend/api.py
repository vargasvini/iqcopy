import sys
import json, configparser
from iqoptionapi.stable_api import IQ_Option

try:
    file_ = open("copy.config")
except IOError:
    print((u'ERROR: arquivo [{}], n\xe3o encontrado.').format(file_))

parser = configparser.ConfigParser()
parser.read("copy.config")
login_conta = parser.get('acesso','login')
senha_conta = parser.get('acesso','senha')

iqoption = IQ_Option(login_conta, senha_conta)

def start():
    class Api:
        def __init__(self):
            self.api = iqoption

        def getApi(self):
            return self.api
        
    api = Api()
    return api

if __name__ == '__main__':
    start()