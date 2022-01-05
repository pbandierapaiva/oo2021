


function alteraCumprimento(elemento) {
	areaTexto = document.getElementById("textop")
	areaTexto.innerHTML = "Oi " + elemento.value +", tudo bem?"
	ele = document.getElementById("entradaNome")
	ele.hidden = true

	bot = document.getElementById("mostraNome")

	bot.className = "w3-container w3-button w3-blue w3-border w3-block"
}

function mostraInputNome(e) {
	e.hidden  = true

	ele = document.getElementById("entradaNome")
	ele.hidden = false
}

function verifica(ev) {
	ev.value
}

function pedeNome() {
  nome = prompt("Entre com seu nome: ")
  elementoP = document.getElementById("textop")
  elementoP.innerHTML = "Oi "+nome+", aponte aqui"
  elementoP.style = "color:blue"
}
