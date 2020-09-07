import subprocess
import sys

requests = sys.argv[1]
websocketclient = sys.argv[2]
pythondateutil = sys.argv[3]
dateutil = sys.argv[4]

def installRequests():
    try:
        subprocess.check_output(['py', '-m', 'pip', 'install', requests])
    except subprocess.CalledProcessError as e:
        print('requests')

def installWebsocketClient():
    try:
        subprocess.check_output(['py', '-m', 'pip', 'install', websocketclient])
    except subprocess.CalledProcessError as e:
        print('websocket-client')

def installPythonDateUtil():
    try:
        subprocess.check_output(['py', '-m', 'pip', 'install', pythondateutil])
    except subprocess.CalledProcessError as e:
        print('python-dateutil')


def start():   
    installRequests()
    installWebsocketClient()
    installPythonDateUtil()

start()