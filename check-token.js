const jwt = require('jsonwebtoken')
const config = require('./config')

module.exports = (req,res,next) => {

  let token = req.headers['x-access-token'] || req.headers['authorization'];
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (token) {
    // Verificação da Expiracao do Token
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) {
            return res.status(401).json({"error": true, "message": 'Não autorizado' });
        }
      req.decoded = decoded;
      next();
    });
  } else {
    return res.status(403).send({
        "error": true,
        "message": 'Token Inválido'
    });
  }
}