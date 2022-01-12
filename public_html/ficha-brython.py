

from browser import document
from browser import alert       #  html, ajax, alert, confirm

def checasenha( ev ):
  conf = document["iconfirma"]
  senha = document["isenha"]
  alert("Checasenha")
  if conf.value != senha.value:
      senha.value = ""
      conf.value = ""
      alert("Senhas não batem")


confirma = document["iconfirma"]

confirma.bind("blur", checasenha)
