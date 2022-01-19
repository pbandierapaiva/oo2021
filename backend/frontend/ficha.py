
from browser import document
from browser import alert, ajax,  html

class EntraTexto(html.DIV):
	def __init__(self, labelStr, valor="", width="", password=False, id=None, acao=None):
		html.DIV.__init__(self)
		if width !="":
			self.style = {"width":width}
		self.inputLbl = html.LABEL(labelStr)
		self.inputCpo = html.INPUT()
		if id: self.inputCpo.id=id
		if password: self.inputCpo.type = 'password'
		if acao: self.acao(acao)
		self.inputCpo.value = valor
		self.inputCpo.className = "w3-input"
		self.alterado = False
		self <= self.inputLbl
		self <= self.inputCpo
	def enable(self):
		self.inputCpo.disabled = False
	def disable(self):
		self.inputCpo.disabled = True
	def valor(self):
		return self.inputCpo.value
	def setavalor(self, val):
		self.inputCpo.value= val
		self.alterado = True
	def acao(self, funcao):
		self.inputCpo.bind("blur", funcao)

def alerta(mensagem="ERRO"):
	document["caixaerro"].style.display = "block"
	document["mensagemerro"].innerHTML = mensagem


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
		return True
	except:
		alerta("CPF inválido => "+ ev.currentTarget.value)
		ev.currentTarget.value = ""
		ev.currentTarget.focus()

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
		html.DIV.__init__(self, Class="w3-container")
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

		self <= self.cpoNome
		self <= self.cpoEmail
		self <= self.cpoCpf
		self <= self.cpoSenha
		self <= self.cpoConf
		self <= self.cpoCep

		self <= html.DIV(Class="w3-twothird" )<= self.cpoLogradouro
		self <= html.DIV(Class="w3-third" )<= self.cpoNumero
		self <= botOK

	def submete(self, ev):

		dados = {'nome':self.cpoNome.valor(),
						'email':self.cpoEmail.valor(),
						'cpf':self.cpoCpf.valor(),
						'senha':self.cpoSenha.valor(),
						'cep':self.cpoCep.valor(),
						'num':self.cpoNumero.valor()
					}
		ajax.post('/user', data=dados, oncomplete=self.completouSubmeteUser)

	def completouSubmeteUser(self, res):
		alert("Retorno da submissão:  "+str(res.json))

document["formficha"] <= Ficha()
