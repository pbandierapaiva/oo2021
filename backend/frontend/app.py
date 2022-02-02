
from browser import document
from browser import alert, ajax,  html

from util import *
from ficha import *

import json


class Login( html.DIV ):
    def __init__(self):
        html.DIV.__init__( self, Class="w3-container w3-center w3-border w3-padding" )
        self <= html.LABEL("Identifique-se", Class="w3-container")
        self.style = {'width':'50%', 'margin':'auto'}
        self.cpf = EntraTexto("CPF")
        self.senha = EntraTexto("senha", password=True)

        botOK = html.BUTTON("OK", type="submit", Class="w3-btn w3-green w3-center w3-margin w3-round-large")
        botOK.bind("click",self.submeteLogin)
        botCad = html.BUTTON("Cadastre-se", Class="w3-btn w3-green w3-center w3-margin w3-round-large")
        botCad.bind("click",self.cadastro)

        self <= self.cpf
        self <= self.senha
        self <= botOK
        self <= botCad

    def submeteLogin(self, ev):
        cpf = self.cpf.valor().strip().replace('.','').replace('-','')
        dados = {'cpf':cpf, 'senha':self.senha.valor()}
        alerta(json.dumps(dados))
        ajax.post('/autentica', data=json.dumps(dados), oncomplete=self.resposta, headers={"Content-Type": "application/json; charset=utf-8"} )

    def cadastro(self, ev):
        document["main"].innerHTML = ""
        document["main"] <= Ficha()


    def resposta(self, res):
        if res.json["status"]=="ERRO":
            alerta(res.json["msg"])
        else:
            alert("Usuário OK")

document["main"].innerHTML=""
document["main"] <= Login()
