

function checasenha(evento) {
  inpsenhaconf = evento.currentTarget
  inpsenha = document.getElementById("isenha")

  ls = document.getElementById("lsenha")
  lc = document.getElementById("lconfirma")


  if( inpsenha.value != inpsenhaconf.value) {
    ls.className = "w3-text-red"
    lc.className = "w3-text-red"

    inpsenhaconf.value =""
    inpsenha.value =""

    inpsenha.focus()
    document.getElementById("errosenha").style.display='block'
    }
  else {
    ls.className = "w3-text-black"
    lc.className = "w3-text-black"
    ls.innerHTML = "Senha OK"
    lc.innerHTML = "Senha OK"
    inpsenhaconf.className = "w3-hide"
    lc.hidden = true
    inpsenha.disabled = true
    }

  }
