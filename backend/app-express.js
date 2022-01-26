const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const fs = require('fs');

const salt = 10;

const port = 3000

app.use('/web',express.static('frontend'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')

})

app.get('/users',(req, res) => {

  try {
    data = fs.readFileSync('.user.json', 'utf8')
    userList = JSON.parse(data)
  } catch (err) {
    console.log("ERRO de leitura de arquivo")
    res.send(JSON.stringify({'status':'ERRO', 'msg':err}))
    }

  retData=[]
  userList.forEach((item) => {
    retData.push({'nome':item.nome, 'email': item.email, 'cpf': item.cpf})
  });

  res.send(JSON.stringify({'status':'OK','users':retData}))
})


app.get('/users/:cpf',(req, res) => {
  paracpf = req.params["cpf"]
  console.log("Procurando CPF  " + paracpf)

  try {
    data = fs.readFileSync('.user.json', 'utf8')
    userList = JSON.parse(data)
  } catch (err) {
    console.log("Arquivo inexistente")
    res.send(JSON.stringify({'status':'ERRO', 'msg':err}))
    return
    }


  achou = false
  itemencontrado = {}
  retData=[]
  userList.forEach((item,i) => {
    if( item.cpf == paracpf ){
      achou = true
      itemencontrado = item

      }
    })

  if(achou) {
    res.send(JSON.stringify({'status':'OK','user':itemencontrado}))
    console.log("CPF encontrado")
  }
  else {
    res.send(JSON.stringify({'status':'ERRO','msg':'CPF não encontrado na base'}))
    console.log("CPF não encontrado")

  }
})


app.post('/user', (req, res) => {
  console.log('Processando post ')
  var bd=[]
  try {
    data = fs.readFileSync('.user.json', 'utf8')
    bd = JSON.parse(data)
    } catch (err) {
          console.log("Arquivo user.json inexistente - será criado")
    }

  bd.forEach((item, i) => {
    if(item.cpf == req.body.cpf) {
        res.send(JSON.stringify({'status':'ERRO','msg':'CPF já cadastrado'}))
        return
      }
    })
  bcrypt.hash(req.body.senha, salt, (err, hash) => {
        req.body.senha = hash
        console.log(bd)
        bd.push(req.body)
        console.log(bd)
        fs.writeFile('.user.json', JSON.stringify(bd), (err) => {
            if(err)
              console.log(err)
        })
      })
})  // POST /user


app.post('/autentica', (req, res) => {

  console.log('autenticando ')
  try {
    data = fs.readFileSync('.user.json', 'utf8')
    userList = JSON.parse(data)
  } catch (err) {
    console.log("ERRO de leitura de arquivo")
    res.send(JSON.stringify({'status':'ERRO', 'msg':err}))
    return
    }
  itens = userList.filter( (item) => {
      return item.cpf == req.body.cpf
  })
  console.log( itens ) // itens encontrados
  if( itens.length > 0 ){   // encontrou o cpf?
      encontrado = itens[0]
      sucesso = bcrypt.compare( req.body.senha, encontrado.senha, (err, resultado) => {
        if(resultado) {
          res.end(JSON.stringify({'status':'OK', 'msg':'Usuário OK'}))
          console.log('senha OK')
          }
        else {
          res.end(JSON.stringify({'status':'ERRO', 'msg':'Senha incorreta'}))
          console.log( 'senha incorreta')
          }
      }) // final do bcrypt.compare
  }
  else {  // não encontrou o CPF
      res.end(JSON.stringify({'status':'ERRO', 'msg':'Usuário não encontrado.'}))
  }
})

app.listen(port, () => {
  console.log(`Monitorando http://localhost:${port}`)
})
