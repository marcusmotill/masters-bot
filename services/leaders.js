const _ = require("lodash");
const async = require("async");
const Xray = require("x-ray");
const xray = Xray();

const entries = require("../data/entries");

const url = "http://www.espn.com/golf/leaderboard";

const scrapper = {
    items: xray(".leaderboard-table", {
        players: xray("tbody", [
            {
                playerName: ".player-overview .playerName .full-name",
                totalScore: ".player-overview .totalScore",
                relativeScore: ".player-overview .relativeScore"
            }
        ])
    })
};

const calculateLeaders = (scorecard, callback) => {
    var leaders = _.map(entries, "name");
    return callback(null, leaders);
};

const getLeaders = callback => {
    async.autoInject(
        {
            scorecard: cb => xray(url, scrapper)(cb),
            leaderboard: (scorecard, cb) => calculateLeaders(scorecard, cb)
        },
        (err, results) => {
            return callback(null, results.leaderboard);
        }
    );
};

exports.getLeaders = getLeaders;
