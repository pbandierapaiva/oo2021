

$(document).ready( function(){
  $("#iconfirma").blur(   function(){
    if( $("#iconfirma").val() != $('#isenha').val()) {
        $('#isenha').addClass("w3-border-red")
        $("#iconfirma").addClass("w3-border-red")
        $('#isenha').value=''
        $("#iconfirma").value=''

        $("#caixaerro").show()
        $("#mensagemerro").text("Verifique sua senha")
      }
    }
  )

  $("#icep").blur( function(){
    cep = $("#icep").val()
    url = "https://viacep.com.br/ws/" + cep + "/json"
    $.get(url,  function(data, status){
      $("#ilogradouro").val(data.logradouro)
      $( "#ilogradouro" ).prop( "disabled", true );
      }
    )
  })

  $("#icpf").blur( function(){
        var Soma;
        var Resto;
        Soma = 0;

      strCPF = $('#icpf').val()
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
  })


});

function corrigeCPF(cpf){
  $("#caixaerro").show()
  $("#mensagemerro").text("CPF inválido: "+cpf)

    inputCPF = $("#icpf")
    inputCPF.val("")
    inputCPF.addClass("w3-text-red")

}
