def copyTradeConfig():
    class copyTradeStructure:
        def __init__(self):
            # GERENCIAMENTO #
            self.stoploss = float(-1500)
            self.valor_minimo = float(100)
            self.valor_oper = float(5)
            # FUNCIONAMENTO #
            self.horaFinal = int(10)
            self.horaRefreshAtivos = int(1)
            self.minutosRefreshRank = int(10)
            self.minutosrefreshPayout = int(30)

        def getHoraFinal(self):
            return self.horaFinal

        def getHoraRefreshAtivos(self):
            return self.horaRefreshAtivos

        def getMinutosRefreshRank(self):
            return self.minutosRefreshRank

    copyTradeConfig = copyTradeStructure()
    return copyTradeConfig