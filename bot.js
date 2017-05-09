var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      botRegex = /^\/cool guy$/;

  if(request.text && botRegex.test(request.text)) {
    this.res.writeHead(200);
    postMessage("Let me get the movies playing now for you","textOnly", nowPlaying);
    this.res.end();
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}

function nowPlaying(){
  var req, chunks, botResponse, textResult, jsonResult;

  const options = {
    "method": "GET",
    "hostname": "api.themoviedb.org",
    "port": null,
    "path": "/3/movie/now_playing?region=US&page=1&language=en-US&api_key=12ba888193247c7cd0bf90ddfd87a29b",
    "headers": {}
  };

  req = HTTPS.request(options, function (res) {
    chunks = [];

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
      textResult = Buffer.concat(chunks);
      console.log('json object:    ' + textResult.toString());
      
      botResponse = '';

      jsonResult = JSON.parse(textResult).results;

      /*jsonResult.sort(function(a, b) {
        b.vote_average - a.vote_average
      });*/

      var total = (jsonResult.length < 11) ? jsonResult.length : 10;

      for(var i = 0; i < total ; i += 1) {
        postMessage(jsonResult[i].title + ' – ' + jsonResult[i].vote_average + '/10', 'https://image.tmdb.org/t/p/w300/' + jsonResult[i].poster_path)
      }
      /*
      jsonResult.forEach(function(movie) {
        postMessage(movie.title + ' – ' + movie.vote_average + '/10', 'https://image.tmdb.org/t/p/w300/' + movie.poster_path)
      });*/


    });
  });

  req.write("{}");
  req.end();

}

function postMessage(botResponse, imageURL, callBack) {
  imageURL = (typeof imageURL === 'undefined') ? 'textOnly' : imageURL;

  var botReq, body;

  const options = {
    hostname: 'api.groupme.com',
    path: '/v3/bots/post',
    method: 'POST'
  };
  if( imageURL === 'textOnly'){
    body = {
      "bot_id" : botID,
      "text" : botResponse
    };  
  } else {
    body = {
      "bot_id" : botID,
      "text" : botResponse,
      "attachments" : [
          {
            "type"  : "image",
            "url"   : imageURL
          }
        ]
    };
  }
  

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
  botReq.on('end', function() {
    JSON.stringify(body);
    callBack();
  });

}


exports.respond = respond;