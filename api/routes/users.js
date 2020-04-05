var express = require('express');
var router = express.Router();
const game = require('./game');

/* GET users listing. */
router.post('/', function(req, res, next) {
  console.log(req.body);
  if (!req.body) {
    return res.sendStatus(500);
  }

  const name = req.body.name;
  const pass = req.body.password;

  if (pass !== 'JesusIsKing') {
    return res.sendStatus(401);
  }

  const id = game.setName(name);

  if (id === 'existing') {
    return res.sendStatus(409);
  } else if(id === 'gameInPlace') {
    return res.sendStatus(410)
  }

  res.send({id});
});

module.exports = router;
