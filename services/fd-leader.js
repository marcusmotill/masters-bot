const _ = require('lodash');
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
    doubles: -3
};

fetch("https://site.web.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard/players?region=us&lang=en&event=401219478", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
    },
    "referrer": "https://www.espn.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
}).then(results => results.json()).then(results => {
    // console.log(results.leaderboard[0])
    // console.log(results.leaderboard[0].stats)
    const runningResults = {};
    entries.forEach((entry) => {
        runningResults[entry.name] = { score: 0, rankScore: 0, eagles: 0, birdies: 0, pars: 0, bogeys: 0, doublesPlus: 0 };
        entry.selections.forEach(player => {
            const playerScorecard = _.find(results.leaderboard, { fullName: player });
            if (playerScorecard) {
                //console.log(`found ${player}`);
            } else {
                throw new Error(`did not find ${player}`);
            }

            runningResults[entry.name].score += rankScore(playerScorecard.rank)
            runningResults[entry.name].rankScore += rankScore(playerScorecard.rank);

            const eagles = _.find(playerScorecard.stats, { name: 'eagles' });
            runningResults[entry.name].score += scoreMultipliers['eagles'] * eagles.value;
            runningResults[entry.name].eagles += eagles.value;

            const birdies = _.find(playerScorecard.stats, { name: 'birdies' });
            runningResults[entry.name].score += scoreMultipliers['birdies'] * birdies.value;
            runningResults[entry.name].birdies += birdies.value;

            const pars = _.find(playerScorecard.stats, { name: 'pars' });
            runningResults[entry.name].score += scoreMultipliers['pars'] * pars.value;
            runningResults[entry.name].pars += pars.value;

            const bogeys = _.find(playerScorecard.stats, { name: 'bogeys' });
            runningResults[entry.name].score += scoreMultipliers['bogeys'] * bogeys.value;
            runningResults[entry.name].bogeys += bogeys.value;

            const doubles = _.find(playerScorecard.stats, { name: 'doubles' });
            runningResults[entry.name].score += scoreMultipliers['doubles'] * doubles.value;
            runningResults[entry.name].doublesPlus += doubles.value;
        })
    });

    const resultsArray = _.map(runningResults, (value, name) => {
        value.name = name;
        return value;
    })

    const leadersString = _(resultsArray).sortBy('score').reverse().map(score => `${score.name}: ${_.round(score.score, 2)}`).join('\n');

    console.log(leadersString)

    const breakDown = _(resultsArray).sortBy('score').reverse().map(score => `${score.name}: ${_.round(score.score, 2)}\n\trank score: ${_.round(score.rankScore, 2)}\n\teagles: ${_.round(score.eagles, 2)}\n\tbirdies: ${_.round(score.birdies, 2)}\n\tpars: ${_.round(score.pars, 2)}\n\tbogeys: ${_.round(score.bogeys, 2)}\n\tdoubles+: ${_.round(score.doublesPlus, 2)}`).join('\n');

    console.log(breakDown)
});

