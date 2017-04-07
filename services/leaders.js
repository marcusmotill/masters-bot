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
    var leadersArr = _.map(entries, entryItem => {
        var total = _.sumBy(entryItem.selections, selection => {
            var playerScorecard = _.find(scorecard.items.players, { playerName: selection });
            if (!playerScorecard) {
                console.log("Unable to find", selection);
                return 0;
            }
            if (playerScorecard.relativeScore == "E") {
                playerScorecard.relativeScore = 0;
            }
            playerScorecard.relativeScore = _.toNumber(playerScorecard.relativeScore);
            return playerScorecard.relativeScore;
        });
        return { name: entryItem.name, total };
    });
    
    leadersArr = _.sortBy(leadersArr, 'total');
    var returnText = '';
    _.forEach(leadersArr, (leaderItem, i) => {
        var index = i + 1;
        var row = `${index}. ${leaderItem.name} Total: ${leaderItem.total > 0 ? '+' : ''}${leaderItem.total}\n`;
        returnText = returnText + row;
    });
    return callback(null, returnText);
};

const calculatePlayers = (scorecard, callback) => {
    var playersArr = _.map(entries, entryItem => {
        var playersString = '';
        
        _.forEach(entryItem.selections, selection => {
            var playerScorecard = _.find(scorecard.items.players, { playerName: selection });
            if (!playerScorecard) {
                console.log("Unable to find", selection);
                return 0;
            }
            if (playerScorecard.relativeScore == "E") {
                playerScorecard.relativeScore = 0;
            }

            var row = `  ${selection} ${playerScorecard.relativeScore}\n`;
            playersString = playersString + row;
        });
        return { name: entryItem.name, playersString };
    });
    
    var returnText = '';
    _.forEach(playersArr, (playerItem, i) => {
        var index = i + 1;
        var row = `${playerItem.name}\n${playerItem.playersString}`;
        returnText = returnText + row;
    });
    return callback(null, returnText);
};

const getLeaders = callback => {
    async.autoInject(
        {
            scorecard: cb => xray(url, scrapper)(cb),
            leaderboard: (scorecard, cb) => calculateLeaders(scorecard, cb)
        },
        (err, results) => {
            console.log(results.leaderboard);
            return callback(null, results.leaderboard);
        }
    );
};

const getPlayers = callback => {
    async.autoInject(
        {
            scorecard: cb => xray(url, scrapper)(cb),
            leaderboard: (scorecard, cb) => calculatePlayers(scorecard, cb)
        },
        (err, results) => {
            console.log(results.leaderboard);
            return callback(null, results.leaderboard);
        }
    );
};

exports.getLeaders = getLeaders;
exports.getPlayers = getPlayers;
