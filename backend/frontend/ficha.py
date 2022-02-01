
from browser import document
from browser import alert, ajax,  html

from util import *
from app import Login

def checasenha( ev ):
	conf = document["iconfirma"]
	senha = document["isenha"]
	if conf.value != senha.value:
			senha.value = ""
			conf.value = ""
			alerta("As senhas não batem")
			senha.classList.add("w3-border-red")
			conf.classList.add("w3-border-red")

def checacpf( ev ):
	Soma = 0;

	try:
		strCPF = ev.currentTarget.value
		strCPF = strCPF.replace('.','')
		strCPF = strCPF.replace('-','')
		if (strCPF == "00000000000"): raise  #corrigeCPF(ev.currentTarget)
		if len(strCPF)!=11:  alerta("CPF inválido => "+ strCPF)
		for i in range(0,9):  Soma = Soma + int(strCPF[i]) * (11 - (i+1) )
		Resto = (Soma * 10) % 11;
		if ((Resto == 10) or (Resto == 11)):  Resto = 0
		if (Resto != int(strCPF[9]) ): raise   #corrigeCPF(ev.currentTarget)
		Soma = 0;
		for i in range(0,10):
		  Soma = Soma + int(strCPF[i]) * (12 - (i+1))
		Resto = (Soma * 10) % 11
		if ((Resto == 10) or (Resto == 11)):
		  Resto = 0
		if Resto != int(strCPF[10] ):
			raise    #corrigeCPF(ev.currentTarget)

		ajax.get("/users/%s"%strCPF, oncomplete=retornoCPF)

		return True
	except:
		alerta("CPF inválido => "+ ev.currentTarget.value)
		ev.currentTarget.value = ""
		ev.currentTarget.focus()

def retornoCPF( res ):
	if res.json["status"]=="ERRO":  # CPF não encontrado
 		return True
	alerta("CPF já cadastrado")


def carregaCEP( ev ):
  cep = document["icep"].value
  ajax.get("https://viacep.com.br/ws/" + cep + "/json", oncomplete=preencheCEP)
  document["inum"].focus()

def preencheCEP( res ):
  resposta = res.json
  document["ilogradouro"].value = resposta["logradouro"]
  document["ilogradouro"].disabled = True

class Ficha(html.DIV):
	def __init__(self):
		html.DIV.__init__(self, Class="w3-container w3-padding w3-margin")

		conti = html.DIV(Class="w3-card-4")
		conti <= html.DIV("Cadstro", Class="w3-container w3-green")
		# Campos INPUT da  ficha
		self.cpoNome = EntraTexto("Nome")
		self.cpoEmail = EntraTexto("e-mail")
		self.cpoCpf = EntraTexto("CPF", acao=checacpf)
		self.cpoSenha = EntraTexto("Senha", password=True, id="isenha")
		self.cpoConf = EntraTexto("Confirma senha", password=True, id="iconfirma", acao=checasenha)
		self.cpoCep = EntraTexto("CEP", id="icep", acao=carregaCEP)
		self.cpoLogradouro = EntraTexto("Logradouro", id="ilogradouro")
		self.cpoNumero = EntraTexto("Número", id="inum")

		botOK = html.BUTTON("OK", type="submit", Class="w3-btn w3-green w3-round-large")#, click=self.submete)
		botOK.bind("click",self.submete)

		conti <= self.cpoNome
		conti <= self.cpoEmail
		conti <= self.cpoCpf
		conti <= self.cpoSenha
		conti <= self.cpoConf
		conti <= self.cpoCep

		conti <= html.DIV(Class="w3-twothird" )<= self.cpoLogradouro
		conti <= html.DIV(Class="w3-third" )<= self.cpoNumero
		conti <= botOK

		self <= conti

	def submete(self, ev):

		if self.cpoSenha.valor()=='' or self.cpoNome.valor()=='' or self.cpoCpf.valor()=='':
			alerta("Campos nome, cpf e senha obrigatórios")
			return
		cpf = self.cpoCpf.valor().strip().replace('.','').replace('-','')

		dados = {'nome':self.cpoNome.valor(),
						'email':self.cpoEmail.valor(),
						'cpf':cpf,
						'senha':self.cpoSenha.valor(),
						'cep':self.cpoCep.valor(),
						'num':self.cpoNumero.valor()
					}
		ajax.post('/user', data=dados, oncomplete=self.completouSubmeteUser)

	def completouSubmeteUser(self, res):
		if res.json["status"] != "OK":
			alerta("ERRO:  "+ res.json["msg"])
		else:
			document["main"].innerHTML=""
			document["main"] <= Login()
