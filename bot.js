var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/cool guy$/;

  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage();
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function postMessage() {
  var botResponse, options, body, botReq;

  //botResponse = cool();

  options = {
    "method": "GET",
    "hostname": "api.themoviedb.org",
    "port": null,
    "path": "/3/movie/popular?page=1&language=en-US&api_key=12ba888193247c7cd0bf90ddfd87a29b",
    "headers": {}
  };

  var req = HTTPS.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on('error', function(err) {
      console.log('error getting movie data '  + JSON.stringify(err));
      botResponse = 'error getting movie data '  + JSON.stringify(err)
    });

    res.on('timeout', function(err) {
      console.log('timeout getting movie data message '  + JSON.stringify(err));
      botResponse = 'timeout getting movie data message '  + JSON.stringify(err);
    });

    res.on("end", function () {
      var wholeResult = Buffer.concat(chunks);
      console.log(body.toString());
      botResponse = wholeResult.toString();
    });
  });

  req.write("{}");
  req.end();

  if(botResponse){
    botResponse = cool();
  }


  options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };

  body = {
    "bot_id" : botID,
    "text" : botResponse
  };

  console.log('sending ' + botResponse + ' to ' + botID);

  botReq = HTTPS.request(options, function(res) {
      if(res.statusCode == 202) {
        //neat
      } else {
        console.log('rejecting bad status code ' + res.statusCode);
      }
  });

  botReq.on('error', function(err) {
    console.log('error posting message '  + JSON.stringify(err));
  });
  botReq.on('timeout', function(err) {
    console.log('timeout posting message '  + JSON.stringify(err));
  });
  botReq.end(JSON.stringify(body));
}


exports.respond = respond;