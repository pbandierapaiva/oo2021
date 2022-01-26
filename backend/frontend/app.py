
from browser import document
from browser import alert, ajax,  html

from util import *


class Login( html.DIV ):
    def __init__(self):
        html.DIV.__init__( self, Class="w3-container w3-center w3-border w3-padding" )
        self.style = {'width':'50%'}
        self.cpf = EntraTexto("CPF")
        self.senha = EntraTexto("senha", password=True)

        botOK = html.BUTTON("OK", type="submit", Class="w3-btn w3-green w3-round-large w3-block")#, click=self.submete)
        botOK.bind("click",self.submeteLogin)

        self <= self.cpf
        self <= self.senha
        self <= botOK

    def submeteLogin(self, ev):
        # alerta("submeteu:  %s %s"%(self.cpf.valor(),self.senha.valor()) )
        cpf = self.cpf.valor().strip().replace('.','').replace('-','')
        dados = {'cpf':cpf, 'senha':self.senha.valor()}
        ajax.post('/autentica', data= dados, oncomplete=self.resposta)

    def resposta(self, res):
        if res.json["status"]=="ERRO":
            alert(res.json["msg"])
        else:
            alert("Usuário OK")



document <= Login()
