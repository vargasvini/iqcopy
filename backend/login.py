# -*- coding: utf-8 -*-  
from iqoptionapi.stable_api import IQ_Option
import sys
import json


iqoption = IQ_Option("login", "senha")
check, reason = iqoption.connect()

real = sys.argv[1]

if check == False:
    print(reason)
else:
    #print(reason)
    result = iqoption.get_profile_ansyc()

    if real == 'REAL':
        iqoption.change_balance("REAL")
    else:
        iqoption.change_balance("PRACTICE")


    userData = {'name': result["first_name"], 'currency': result["currency"], 'balance': iqoption.get_balance(), 'avatar': result["avatar"]}
    python2json = json.dumps(userData)
    print(python2json)
