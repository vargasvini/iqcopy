import configparser

def copyTradeConfig():
    class copyTradeStructure:
        def __init__(self):
            # ACESSO #
            self.userKey = ''
            # SELECIONAR TRADER #
            self.tipoFollow = ''
            self.followRank = 1
            self.followId = ''
            self.blockId = ''
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
            self.selectedParidades = ''
            # FUNCIONAMENTO #
            self.horaFinal = int(10)
            self.horaRefreshAtivos = int(1)
            self.minutosRefreshRank = int(10)
            self.minutosrefreshPayout = int(30)
            # EXTRAS #
            self.valorEntradaAtual = float(2)
            self.valorEntradaAnterior = float(2)
            self.qtdMartingaleAtual = int(0)
            self.saldoAtual = float(0)
            self.tradersToFollow = []
            self.tradersToBlock = []
            self.ativosAbertosBinarias = []
            self.ativosAbertosDigitais = []
            self.paridadesList = []
            # THREAD CONTROL #
            self.isBinarias = False
            self.isDigitais = False
            self.threadList = []

        ###### GETTERS #######
        # ACESSO #
        def getUserKey(self):
            return self.userKey
        # SELECIONAR TRADER #
        def getTipoFollow(self):
            return self.tipoFollow
        def getFollowRank(self):
            return int(self.followRank)
        def getFollowId(self):
            return self.followId
        def getBlockId(self):
            return self.blockId
        # GERENCIAMENTO #
        def getTipoGerenciamento(self):
            return self.tipoGerenciamento
        def getValorEntrada(self):
            return round(float(self.valorEntrada),2)
        def getQtdMartingales(self):
            return int(self.qtdMartingales)
        def getValorStopWin(self):
            return round(float(self.valorStopWin),2)
        def getValorStopLoss(self):
            return round(float(self.valorStopLoss),2)
        def getValorMinimoTrader(self):
            return round(float(self.valorMinimoTrader),2)
        # CONFIGURAÇÕES #
        def getTipoConta(self):
            return self.tipoConta
        def getTipoOpcoes(self):
            return self.tipoOpcoes
        def getTipoExpiracao(self):
            return self.tipoExpiracao
        def getSelectedParidades(self):
            return self.selectedParidades
        # FUNCIONAMENTO #
        def getHoraFinal(self):
            return self.horaFinal
        def getHoraRefreshAtivos(self):
            return self.horaRefreshAtivos
        def getMinutosRefreshRank(self):
            return self.minutosRefreshRank
        # EXTRAS #
        def getValorEntradaAtual(self):
            return round(float(self.valorEntradaAtual),2)
        def getValorEntradaAnterior(self):
            return round(float(self.valorEntradaAnterior),2)
        def getQtdMartingaleAtual(self):
            return int(self.qtdMartingaleAtual)
        def getSaldoAtual(self):
            return round(float(self.saldoAtual),2)
        def getTradersToFollow(self):
            return self.tradersToFollow
        def getTradersToBlock(self):
            return self.tradersToBlock
        def getAtivosAbertosBinarias(self):
            return self.ativosAbertosBinarias
        def getAtivosAbertosDigitais(self):
            return self.ativosAbertosDigitais
        def getParidadesList(self):
            return self.paridadesList
        # THREAD CONTROL #
        def getIsBinariasRunning(self):
            return self.isBinarias
        def getIsDigitaisRunning(self):
            return self.isDigitais
        def getThreadList(self):
            return self.threadList

        ###### SETTERS #######
        # ACESSO #
        def setUserKey(self, _userKey):
            self.userKey = _userKey
        # SELECIONAR TRADER #
        def setTipoFollow(self, _tipoFollow):
            self.tipoFollow = _tipoFollow
        def setFollowRank(self, _followRank):
            self.followRank = _followRank
        def setFollowId(self, _followId):
            self.followId = _followId
        def setBlockId(self, _blockId):
            self.blockId = _blockId
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
        def setSelectedParidades(self, _selectedParidades):
            self.selectedParidades = _selectedParidades
        # EXTRAS #
        def setValorEntradaAtual(self, _valorEntradaAtual):
            self.valorEntradaAtual = _valorEntradaAtual
        def setValorEntradaAnterior(self, _valorEntradaAnterior):
            self.valorEntradaAnterior = _valorEntradaAnterior
        def setQtdMartingaleAtual(self, _qtdMartingaleAtual):
            self.qtdMartingaleAtual = _qtdMartingaleAtual
        def setSaldoAtual(self, _saldoAtual):
            self.saldoAtual = _saldoAtual
        def setTradersToFollow(self, _tradersToFollow):
            self.tradersToFollow = _tradersToFollow
        def setTradersToBlock(self, _tradersToBlock):
            self.tradersToBlock = _tradersToBlock
        def setAtivosAbertosBinarias(self, _ativosAbertosBinarias):
            self.ativosAbertosBinarias = _ativosAbertosBinarias
        def setAtivosAbertosDigitais(self, _ativosAbertosDigitais):
            self.ativosAbertosDigitais = _ativosAbertosDigitais
        def setParidadesList(self, _paridadesList):
            self.paridadesList = _paridadesList
        # THREAD CONTROL #
        def setIsBinariasRunning(self, _isBinarias):
            self.isBinarias = _isBinarias
        def setIsDigitaisRunning(self, _isDigitais):
            self.isDigitais = _isDigitais
        def setThreadList(self, _threadList):
            self.threadList = _threadList


    copyTradeConfig = copyTradeStructure()
    return copyTradeConfig

def startConfig():
    class Config:
        def __init__(self):
            self.config = copyTradeConfig()

        def setValuesFromFile(self):           
            parser = configparser.ConfigParser()
            parser.read("copy.config")
            
            # ACESSO #
            self.config.setUserKey(parser.get('acesso', 'userKey'))
            # SELECIONAR TRADER #
            self.config.setTipoFollow(parser.get('seguirTrader', 'tipoFollow'))
            self.config.setFollowRank(parser.get('seguirTrader', 'followRank'))
            self.config.setFollowId(parser.get('seguirTrader', 'followId'))
            self.config.setBlockId(parser.get('seguirTrader', 'blockId'))
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
            self.config.setSelectedParidades(parser.get('configuracoes', 'selectedParidades'))

        def getConfig(self):
            self.setValuesFromFile()
            return self.config
    
    config = Config()
    return config

if __name__ == '__main__':
    startConfig()