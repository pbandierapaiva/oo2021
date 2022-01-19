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
  fs.readFile('user.json', 'utf8' , (err, data) => {
    if(err) {
      console.log("ERRO de leitura de arquivo")
      res.send(JSON.stringify({'status':'ERRO', 'msg':'ERRO de leitura de arquivo'}))
    }

    console.log( eval(data) )

  })
  res.send('Fez alguma coisa')
})

app.post('/user', (req, res) => {
  console.log('Processando post ')
  var senhacod=''
  var bd=[]
  try {
    data = fs.readFileSync('user.json', 'utf8')
    bd = JSON.parse(data)
  } catch (err) {
          console.log("Arquivo user.json inexistente")
    }

  bcrypt.hash(req.body.senha, salt, (err, hash) => {
    senhacod = hash
    console.log(senhacod)

    req.body.senha = senhacod

    bd.push(req.body)

    console.log(bd)

    fs.appendFile('user.json', JSON.stringify(bd), (err) => {
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
