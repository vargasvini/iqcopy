import configparser

def copyTradeConfig():
    class copyTradeStructure:
        def __init__(self):
            # SELECIONAR TRADER #
            self.tipoFollow = ''
            self.followRank = 1
            self.followId = ''
            # GERENCIAMENTO #
            self.tipoGerenciamento = ''
            self.valorEntrada = float(2)
            self.qtdMartingales = 1
            self.valorStopWin = float(2)
            self.valorStopLoss = float(2)
            self.valorMinimoTrader = float(2)
            # CONFIGURAÇÕES #
            self.tipoConta = ''
            self.tipoOpcoes = ''
            self.tipoExpiracao = ''
            # FUNCIONAMENTO #
            self.horaFinal = int(10)
            self.horaRefreshAtivos = int(1)
            self.minutosRefreshRank = int(10)
            self.minutosrefreshPayout = int(30)

        ###### GETTERS #######
        # SELECIONAR TRADER #
        def getTipoFollow(self):
            return self.tipoFollow
        def getFollowRank(self):
            return int(self.followRank)
        def getFollowId(self):
            return self.followId
        # GERENCIAMENTO #
        def getTipoGerenciamento(self):
            return self.tipoGerenciamento
        def getValorEntrada(self):
            return float(self.valorEntrada)
        def getQtdMartingales(self):
            return int(self.qtdMartingales)
        def getValorStopWin(self):
            return float(self.valorStopWin)
        def getValorStopLoss(self):
            return float(self.valorStopLoss)
        def getValorMinimoTrader(self):
            return float(self.valorMinimoTrader)
        # CONFIGURAÇÕES #
        def getTipoConta(self):
            return self.tipoConta
        def getTipoOpcoes(self):
            return self.tipoOpcoes
        def getTipoExpiracao(self):
            return self.tipoExpiracao
        # FUNCIONAMENTO #
        def getHoraFinal(self):
            return self.horaFinal
        def getHoraRefreshAtivos(self):
            return self.horaRefreshAtivos
        def getMinutosRefreshRank(self):
            return self.minutosRefreshRank

        ###### SETTERS #######
        # SELECIONAR TRADER #
        def setTipoFollow(self, _tipoFollow):
            self.tipoFollow = _tipoFollow
        def setFollowRank(self, _followRank):
            self.followRank = _followRank
        def setFollowId(self, _followId):
            self.followId = _followId
        # GERENCIAMENTO #
        def setTipoGerenciamento(self, _tipoGerenciamento):
            self.tipoGerenciamento = _tipoGerenciamento
        def setValorEntrada(self, _valorEntrada):
            self.valorEntrada = _valorEntrada
        def setQtdMartingales(self, _qtdMartingales):
            self.qtdMartingales = _qtdMartingales
        def setValorStopWin(self, _valorStopWin):
            self.valorStopWin = _valorStopWin
        def setValorStopLoss(self, _valorStopLoss):
            self.valorStopLoss = _valorStopLoss
        def setValorMinimoTrader(self, _valorMinimoTrader):
            self.valorMinimoTrader = _valorMinimoTrader
        # CONFIGURAÇÕES #
        def setTipoConta(self, _tipoConta):
            self.tipoConta = _tipoConta
        def setTipoOpcoes(self, _tipoOpcoes):
            self.tipoOpcoes = _tipoOpcoes
        def setTipoExpiracao(self, _tipoExpiracao):
            self.tipoExpiracao = _tipoExpiracao

    copyTradeConfig = copyTradeStructure()
    return copyTradeConfig

def startConfig():
    class Config:
        def __init__(self):
            self.config = copyTradeConfig()

        def setValuesFromFile(self):           
            parser = configparser.ConfigParser()
            parser.read("copy.config")

            # SELECIONAR TRADER #
            self.config.setTipoFollow(parser.get('seguirTrader', 'tipoFollow'))
            self.config.setFollowRank(parser.get('seguirTrader', 'followRank'))
            self.config.setFollowId(parser.get('seguirTrader', 'followId'))
            # GERENCIAMENTO #
            self.config.setTipoGerenciamento(parser.get('gerenciamento', 'tipoGerenciamento'))
            self.config.setValorEntrada(parser.get('gerenciamento', 'valorEntrada'))
            self.config.setQtdMartingales(parser.get('gerenciamento', 'qtdMartingales'))
            self.config.setValorStopWin(parser.get('gerenciamento', 'valorStopWin'))
            self.config.setValorStopLoss(parser.get('gerenciamento', 'valorStopLoss'))
            self.config.setValorMinimoTrader(parser.get('gerenciamento', 'valorMinimoTrader'))
            # CONFIGURAÇÕES #
            self.config.setTipoConta(parser.get('configuracoes', 'tipoConta'))
            self.config.setTipoOpcoes(parser.get('configuracoes', 'tipoOpcoes'))
            self.config.setTipoExpiracao(parser.get('configuracoes', 'tipoExpiracao'))

        def getConfig(self):
            self.setValuesFromFile()
            return self.config
    
    config = Config()
    return config

if __name__ == '__main__':
    startConfig()