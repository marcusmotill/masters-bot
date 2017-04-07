const HTTPS = require("https");
const _ = require("lodash");
const async = require("async");
const LeaderService = require("./services/leaders.js");

const mastersRegex = /^\/masters*/;
const playerRegex = /^\/players*/;
const bot_id = process.env.BOT_ID;

const getLeadersAndPost = request => {
    LeaderService.getLeaders((err, leaders) => {
        const message = request.text;
        const sender = request.sender_id;
        const options = {
            hostname: "api.groupme.com",
            path: "/v3/bots/post",
            method: "POST"
        };

        const body = {
            bot_id,
            text: leaders
        };

        console.log(`Sending ${_.get(body, "text")} to ${bot_id}`);

        botReq = HTTPS.request(options, function(res) {
            console.log(`res.statusCode ${res.statusCode}`);
        });

        botReq.on("error", function(err) {
            console.log(`error posting message ${JSON.stringify(err)}`);
        });

        botReq.on("timeout", function(err) {
            console.log(`timeout posting message ${JSON.stringify(err)}`);
        });

        botReq.end(JSON.stringify(body));
    });
};

const getPlayersAndPost = (request) => {
    LeaderService.getPlayers((err, players) => {
        const message = request.text;
        const sender = request.sender_id;
        const options = {
            hostname: "api.groupme.com",
            path: "/v3/bots/post",
            method: "POST"
        };

        const body = {
            bot_id,
            text: players
        };

        console.log(`Sending ${_.get(body, "text")} to ${bot_id}`);

        botReq = HTTPS.request(options, function(res) {
            console.log(`res.statusCode ${res.statusCode}`);
        });

        botReq.on("error", function(err) {
            console.log(`error posting message ${JSON.stringify(err)}`);
        });

        botReq.on("timeout", function(err) {
            console.log(`timeout posting message ${JSON.stringify(err)}`);
        });

        botReq.end(JSON.stringify(body));
    });    
};

const respond = function() {
    const request = JSON.parse(this.req.chunks[0]);

    if (request.text && mastersRegex.test(request.text)) {
        getLeadersAndPost(request);
    } else if (request.text && playerRegex.test(request.text)) {
        getPlayersAndPost(request);
    }

    this.res.writeHead(200);
    return this.res.end();
};

exports.respond = respond;
