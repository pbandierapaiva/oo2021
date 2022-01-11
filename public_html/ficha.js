
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

    document.getElementById("caixaerro").style.display='block'
    document.getElementById("mensagemerro").innerHTML = "Verifique sua senha"
    inpsenha.focus()

    }
  else {
    ls.className = "w3-text-black"
    lc.className = "w3-text-black"
    ls.innerHTML = "Senha OK"
    inpsenhaconf.className = "w3-hide"
    lc.hidden = true
    inpsenha.className = "w3-hide"
    }

  }

  function testaCPF(evento) {
      var Soma;
      var Resto;
      Soma = 0;

    strCPF = evento.currentTarget.value
    strCPF = strCPF.replace('.','')
    strCPF = strCPF.replace('.','')
    strCPF = strCPF.replace('-','')

    if (strCPF == "00000000000") corrigeCPF(strCPF);

    for (i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;

      if ((Resto == 10) || (Resto == 11))  Resto = 0;
      if (Resto != parseInt(strCPF.substring(9, 10)) ) corrigeCPF(strCPF);

    Soma = 0;
      for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
      Resto = (Soma * 10) % 11;

      if ((Resto == 10) || (Resto == 11))  Resto = 0;
      if (Resto != parseInt(strCPF.substring(10, 11) ) ) corrigeCPF(strCPF);
      return true;
  }
function corrigeCPF(cpf){
  document.getElementById("caixaerro").style.display='block'
  document.getElementById("mensagemerro").innerHTML = "CPF inválido: "+cpf

    inputCPF = document.getElementById("icpf")
    inputCPF.value=""
    inputCPF.className = "w3-text-red"

}



  function pegaDadosCep(evento) {
    const xhttp = new XMLHttpRequest()

    cpoCep = evento.currentTarget

    url = "https://viacep.com.br/ws/" + cpoCep.value + "/json"
    xhttp.onload = dadosCepCarregados

    xhttp.open("GET", url);
    xhttp.send();

  }

  function dadosCepCarregados() {
      resp = JSON.parse(this.responseText)
      cpoLogr = document.getElementById("ilogradouro")
      cpoLogr.value = resp.logradouro
      cpoLogr.disabled = true
      document.getElementById("inum").focus()
  }
