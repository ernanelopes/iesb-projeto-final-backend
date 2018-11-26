
// Dependencias Basicas para Autenticacao JWT
const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const router = express.Router()

// Arquivo de configurações
const config = require('./config')

// Lista de Tokens
const tokenList = {}

// Instancia do Express
const app = express()

router.get('/', (req,res) => {
    res.send('Home Page');
})

router.post('/login', (req,res) => {
    const postData = req.body;
    const user = {
        "email": postData.email,
        "name": postData.name,
        "secret": postData.secret
    }

    // Criação do token basico
    const token = jwt.sign(user, user.secret, { expiresIn: config.tokenLife})

    // Criação do token de refresh
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife})

    const response = {
        "status": "Login com Sucesso",
        "token": token,
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
            "token": token,
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

app.use(bodyParser.json())
app.use('/api', router)

// configurando para ouvir porta 3000
app.listen(config.port || process.env.port || 3000);