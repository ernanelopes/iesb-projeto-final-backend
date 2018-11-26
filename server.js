
// Dependencias Basicas 
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const _ = require("underscore")

const router = express.Router()

// Arquivo de configurações
const config = require('./config')

// Lista de Tokens
const tokenList = {}

// Instancia do Express
const app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

const tarefas = [];

router.get('/', (req,res) => {
    res.send('Home Page');
})

router.post('/login', (req,res) => {
    const postData = req.body;
    const user = {
        "email": postData.email,
        "name": postData.name
    }

    // Criação do token basico
    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})

    // Persistencia do token
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})

    const response = {
        "status": "Login com Sucesso",
        access_token: token,
        "refreshToken": refreshToken,
    }

    // Adiciona o Token ao array de tokens
    tokenList[refreshToken] = response
    // Retorna Sucesso
    res.status(200).json(response);
})

router.post('/token', (req,res) => {

    const postData = req.body
    
    if((postData.refreshToken) && (postData.refreshToken in tokenList)) {
        const user = {
            "email": postData.email,
            "name": postData.name
        }
        const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife})
        const response = {
            token : token,
        }
        
        // Atualizando Token
        tokenList[postData.refreshToken].token = token
        res.status(200).json(response);        
    } else {
        res.status(404).send('Not Found')
    }
})

router.use(require('./check-token'))

router.get('/secure', (req,res) => {
    res.send('Ok')
})

router.get("/teste", (rep, resp) => {
    console.log("Efetuou uma requisicao");
    resp.send("Lorem ipsum dolor sit amet");
})

//POST 
router.post("/tarefa", (req, resp) => {
    const tarefa = {
        id: _.random(0, 1000),
        titulo : req.body.titulo,
        descricao : req.body.descricao,
        prioritaria: req.body.prioritaria,
        terminada : req.body.prioritaria
    }
    tarefas.push(tarefa);
    resp.status(204);
    resp.send(tarefa);
})

//GET List
router.get("/tarefa", (req, resp) => {
    resp.send(tarefas);
})

//GET by id
router.get("/tarefa/:id", (req, resp) => {
    const id = req.params.id;

    if(!id){
        resp.status(204);
        resp.send();
    }

    const result = tarefas.find(a => a.id == id);
    
    if(result){
        resp.send(result);
    }else{
        resp.status(204);
        resp.send();
    }
})

//DELETE
router.delete("/tarefa/:id", (req, resp) => {
    const id = req.params.id;
    const id2 = req.query.id;
   
    if(!id){
        resp.status(503);
        resp.send();
    }  

    const result = tarefas.find(a => a.id == id);
    
    if(result){
        tarefas.splice(tarefas.indexOf(a => a.id == id))
        resp.send();
    }else{
        resp.status(204);
        resp.send();
    }
})

//PUT
router.put("/tarefa", (req, resp) => {
    const result = tarefas.find(a => a.id == req.body.id);

    if(result){  
        const tarefa = {
            id: result.id, 
            titulo : req.body.titulo,
            descricao : req.body.descricao,
            prioritaria: req.body.prioritaria,
            terminada : req.body.prioritaria
        }

        tarefas.splice(tarefas.indexOf(a => a.id == id))
        tarefas.push(tarefa);

        resp.send();
    }else{
        resp.status(404);
        resp.send();
    }
})


app.use('/api', router)
// configurando para ouvir porta 3000
app.listen(config.port || process.env.port || 3000);