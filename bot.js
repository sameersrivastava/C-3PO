var HTTPS = require('https');
var cool = require('cool-ascii-faces');
var Pokedex = require('pokedex-promise-v2');

var botID = process.env.BOT_ID;

function respond() {
  var request = JSON.parse(this.req.chunks[0]),
      commandRegex = /^\//,
      nowPlayingRegex = /^\/movies now playing$/,
      upcomingRegex = /^\/movies upcoming$/,
      pokemonRegex = /(?=^\/pokemon)(?=^\s*\S+(?:\s+\S+){1}\s*$)/gm;

  if(request.text && commandRegex.test(request.text)) {
    if(nowPlayingRegex.test(request.text)){
      this.res.writeHead(200);
      moviesAPI('now_playing');
      this.res.end();
    } else if(upcomingRegex.test(request.text)){
      this.res.writeHead(200);
      moviesAPI('upcoming');
      this.res.end();
    } else if(pokemonRegex.test(request.text)){
      this.res.writeHead(200);
      pokemon(request.text.split()[1]);
      this.res.end();
    } else {
      this.res.writeHead(200);
      postMessage('This is not the command you are looking for.', 'https://cdn.meme.am/cache/instances/folder859/500x/49467859/jedi-knight-this-is-not-the-webpage-you-are-looking-for.jpg');
      this.res.end();
    }
  } else {
    console.log("don't care");
    this.res.writeHead(200);
    this.res.end();
  }
}


function pokemon(pokemonName){
  var req, chunks, botResponse, textResult, jsonResult;

  const options = {
    "method": "GET",
    "hostname": "pokeapi.co",
    "port": null,
    "path": "/api/v2/pokemon/" + pokemonName,
    "headers": {}
  };

  req = HTTPS.request(options, function (res) {
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
          var body = Buffer.concat(chunks);
          console.log(JSON.parse(body.toString()));

          pokemonObject = JSON.parse(textResult);

          postMessage('Found ' + pokemonObject.name, pokemonObject.sprites.front_default);

      });
  });

  req.end();


 


 
  
  /*
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

     

      var total = (jsonResult.length < 11) ? jsonResult.length : 10;

      for(var i = 0; i < total ; i += 1) {
        postMessage(jsonResult[i].title + ' – ' + jsonResult[i].vote_average + '/10', 'https://image.tmdb.org/t/p/w300/' + jsonResult[i].poster_path)
      }

    });
  });

  req.write("{}");
  req.end();
  */

}


function postMessage(botResponse, imageURL) {
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
  botReq.end(JSON.stringify(body));

}


exports.respond = respond;