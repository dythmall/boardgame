var express = require('express');
var router = express.Router();
const game = require('./game');

/* GET users listing. */
router.post('/', function(req, res, next) {
    console.log(req.body);
    if (!req.body) {
      return res.sendStatus(500);
    }

    const gameName = req.body.gameName;
    const id = game.create(gameName);
    res.send({id});
});

module.exports = router;
