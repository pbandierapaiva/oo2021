const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const fs = require('fs');

const salt = 10;

const port = 3000

app.use('/fe',express.static('frontend'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/oi/:nome', (req, res) => {
  res.send('Oi '+req.params["nome"])
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
    retData.push({'nome':item.nome, 'email': item.email})
  });

  res.send(JSON.stringify({'status':'OK','users':retData}))
})

app.post('/user', (req, res) => {
  console.log('Processando post ')
  var senhacod=''
  var bd=[]
  try {
    data = fs.readFileSync('.user.json', 'utf8')
    bd = JSON.parse(data)
    } catch (err) {
          console.log("Arquivo user.json inexistente - será criado")
    }

  bcrypt.hash(req.body.senha, salt, (err, hash) => {
    req.body.senha = hash
    console.log(bd)

    bd.push(req.body)

    console.log(bd)

    fs.writeFile('.user.json', JSON.stringify(bd), (err) => {
        if(err)
          console.log(err)
    })

    });



  console.log(req.body)

  res.send(JSON.stringify({'status':'OK'}))
})





app.listen(port, () => {
  console.log(`Monitorando http://localhost:${port}`)
})
