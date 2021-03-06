const _ = require('lodash');
const the = require('await-the');
const fetch = require('node-fetch');
const entries = require('../data/entries.js');

// scoring guide from https://www.fanduel.com/fantasy-golf

const rankScore = (rank) => {
    if (rank === 1) {
        return 30;
    }

    if (rank === 2) {
        return 20;
    }

    if (rank === 3) {
        return 18;
    }

    if (rank === 4) {
        return 16;
    }

    if (rank === 5) {
        return 14;
    }

    if (rank === 6) {
        return 12;
    }

    if (rank === 7) {
        return 10;
    }

    if (rank === 8) {
        return 8;
    }

    if (rank === 9) {
        return 7;
    }

    if (rank === 10) {
        return 6;
    }

    if (rank >= 11 && rank <= 15) {
        return 5;
    }

    if (rank >= 16 && rank <= 20) {
        return 4;
    }

    if (rank >= 21 && rank <= 25) {
        return 3;
    }

    if (rank >= 26 && rank <= 30) {
        return 2;
    }

    if (rank >= 31 && rank <= 40) {
        return 1;
    }

    return 0;
};

const scoreMultipliers = {
    eagles: 7,
    birdies: 3.1,
    pars: 0.5,
    bogeys: -1,
    doubles: -3,
};

const getLeaderData = async () => {
    const results = await fetch(
        'https://site.web.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard/players?region=us&lang=en&event=401219478',
        {
            headers: {
                accept: '*/*',
                'accept-language': 'en-US,en;q=0.9',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site',
            },
            referrer: 'https://www.espn.com/',
            referrerPolicy: 'strict-origin-when-cross-origin',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
        }
    ).then((results) => results.json());

    // console.log(results.leaderboard[0])
    // console.log(results.leaderboard[0].stats)
    const runningResults = {};
    const knownPlayers = {};

    await the.each(entries, async (entry) => {
        runningResults[entry.name] = {
            score: 0,
            rankScore: 0,
            eagles: 0,
            birdies: 0,
            pars: 0,
            bogeys: 0,
            doublesPlus: 0,
            players: [],
            rounds: [[], [], [], []],
        };

        await the.each(entry.selections, async (player) => {
            const playerScorecard = _.find(results.leaderboard, { fullName: player });
            if (playerScorecard) {
                //console.log(`found ${player}`);
            } else {
                console.error(`did not find ${player}`)
                return;
                //throw new Error(`did not find ${player}`);
            }

            const playerRankScore = rankScore(playerScorecard.rank);
            runningResults[entry.name].score += playerRankScore;
            runningResults[entry.name].rankScore += playerRankScore;

            if (!knownPlayers[player]) {
                const playerStats = await fetch(
                    `https://site.web.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard/401219478/playersummary?region=us&lang=en&season=2021&player=${playerScorecard.id}`,
                    {
                        headers: {
                            accept: 'application/json, text/plain, */*',
                            'accept-language': 'en-US,en;q=0.9',
                            'sec-fetch-dest': 'empty',
                            'sec-fetch-mode': 'cors',
                            'sec-fetch-site': 'same-site',
                        },
                        referrer: 'https://www.espn.com/',
                        referrerPolicy: 'strict-origin-when-cross-origin',
                        body: null,
                        method: 'GET',
                        mode: 'cors',
                        credentials: 'omit',
                    }
                ).then((result) => result.json());

                knownPlayers[player] = playerStats;
            }

            let totalEagles = 0;
            let totalEagleScore = 0;
            let totalBirdies = 0;
            let totalBirdieScore = 0;
            let totalPars = 0;
            let totalParScore = 0;
            let totalBogeys = 0;
            let totalBogeyScore = 0;
            let totalDoubles = 0;
            let totalDoubleScore = 0;

            const playerStats = knownPlayers[player];

            _.forEach(playerStats.rounds, (round, index) => {
                const roundPlayerRankScore = rankScore(round.currentPosition);
                const scores = _.countBy(round.linescores, (item) => {
                    const diff = item.value - item.par;
                    if (diff < -1) {
                        return 'eagle';
                    }

                    if (diff === -1) {
                        return 'birdie';
                    }

                    if (diff === 0) {
                        return 'par';
                    }

                    if (diff === 1) {
                        return 'bogey';
                    }

                    if (diff > 1) {
                        return 'double';
                    }
                });

                const eagles = scores['eagle'] || 0;
                const eagleScore = scoreMultipliers['eagles'] * eagles;
                totalEagles += eagles;
                totalEagleScore += eagleScore;

                const birdies = scores['birdie'] || 0;
                const birdieScore = scoreMultipliers['birdies'] * birdies;
                totalBirdies += birdies;
                totalBirdieScore += birdieScore;

                const pars = scores['par'] || 0;
                const parScore = scoreMultipliers['pars'] * pars;
                totalPars += pars;
                totalParScore += parScore;

                const bogeys = scores['bogey'] || 0;
                const bogeyScore = scoreMultipliers['bogeys'] * bogeys;
                totalBogeys += bogeys;
                totalBogeyScore += bogeyScore;

                const doubles = scores['double'] || 0;
                const doubleScore = scoreMultipliers['doubles'] * doubles;
                totalDoubles += doubles;
                totalDoubleScore += doubleScore;

                runningResults[entry.name].rounds[index].push({
                    name: player,
                    score: _.round(
                        roundPlayerRankScore + eagleScore + birdieScore + parScore + bogeyScore + doubleScore,
                        2
                    ),
                    rank: `${round.currentPosition} (${_.round(roundPlayerRankScore, 2)})`,
                    eagles: `${eagles} (${_.round(eagleScore, 2)})`,
                    birdies: `${birdies} (${_.round(birdieScore, 2)})`,
                    pars: `${pars} (${_.round(parScore, 2)})`,
                    bogeys: `${bogeys} (${_.round(bogeyScore, 2)})`,
                    doubles: `${doubles} (${_.round(doubleScore, 2)})`,
                });

                runningResults[entry.name].rounds[index] = _(runningResults[entry.name].rounds[index])
                    .sortBy('score')
                    .reverse()
                    .value();
            });

            runningResults[entry.name].score +=
                totalEagles + totalBirdies + totalPars + totalBogeys + totalDoubles;

            runningResults[entry.name].players.push({
                name: player,
                score: _.round(
                    playerRankScore + totalEagles + totalBirdies + totalPars + totalBogeys + totalDoubles,
                    2
                ),
                rank: `${playerScorecard.rank} (${_.round(playerRankScore, 2)})`,
                eagles: `${totalEagles} (${_.round(totalEagleScore, 2)})`,
                birdies: `${totalBirdies} (${_.round(totalBirdieScore, 2)})`,
                pars: `${totalPars} (${_.round(totalParScore, 2)})`,
                bogeys: `${totalBogeys} (${_.round(totalBogeyScore, 2)})`,
                doubles: `${totalDoubles} (${_.round(totalDoubleScore, 2)})`,
            });
        });
    });

    const resultsArray = _(runningResults)
        .map((value, name) => {
            value.name = name;
            value.players = _.reverse(_.sortBy(value.players, 'score'));
            value.score = _.round(value.score, 2);
            return value;
        })
        .sortBy('score')
        .reverse()
        .value();

    return resultsArray;
};

exports.getLeaderData = getLeaderData;
