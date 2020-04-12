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
  let id = req.body.id;

  if (!(pass === 'JesusIsKing' || pass === 'Amazon@123')) {
    return res.sendStatus(401);
  }

  id = game.setName(name, id);

  if (id === 'existing') {
    return res.sendStatus(409);
  } else if(id === 'gameInPlace') {
    return res.sendStatus(410)
  }

  const games = game.getGames();
  res.send({id, games});
});

module.exports = router;
