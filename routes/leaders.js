var express = require('express');
var router = express.Router();
const leaderService = require('../services/fd-leader.js')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const output = await leaderService.getLeaderData();
  res.send(output);
});

module.exports = router;
