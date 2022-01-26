
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
