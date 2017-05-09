var HTTPS = require('https');
var HTTP = require('http');
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
    if(nowPlayingRegex.test(request.text)){ //command = /movies now playing
      this.res.writeHead(200);
      moviesAPI('now_playing');
      this.res.end();
    } else if(upcomingRegex.test(request.text)){ //command = /movies upcoming
      this.res.writeHead(200);
      moviesAPI('upcoming');
      this.res.end();
    } else if(pokemonRegex.test(request.text)){ //command = /pokemon <pokemonName>
      this.res.writeHead(200);
      pokemon(request.text.split(' ')[1]);
      this.res.end();
    } else { //command = /<command does not exist>
      this.res.writeHead(200);
      postMessage('This is not the command you are looking for.', 'https://cdn.meme.am/cache/instances/folder859/500x/49467859/jedi-knight-this-is-not-the-webpage-you-are-looking-for.jpg');
      this.res.end();
    }
  } else {
    console.log("Not a command");
    this.res.writeHead(200);
    this.res.end();
  }
}

/*
* Sends a get request to the pokeapi (http://pokeapi.co/) to get the pokemon passed in the 
* function. Will print out a sprite if it finds the pokemon. Otherwise gives a Missingno.
* 
* @param pokemonName name or number of the pokemon you want
*/
function pokemon(pokemonName){ 
  var req, chunks, body, pokemonObject;

  const options = {
    "method": "GET",
    "hostname": "pokeapi.co",
    "port": null,
    "path": "/api/v2/pokemon/" + pokemonName + "/",
    "headers": {}
  };

  req = HTTP.request(options, function (res) {
      chunks = [];

      res.on("data", function (chunk) {
          chunks.push(chunk);
      });

      res.on('error', function(err) {
        console.log('error getting pokemon data '  + JSON.stringify(err));
      });

      res.on('timeout', function(err) {
        console.log('timeout getting pokemon data message '  + JSON.stringify(err));
      });

      res.on("end", function () {
          body = Buffer.concat(chunks);
          //console.log('response: ' + body.toString());

          pokemonObject = JSON.parse(body);

          if(pokemonObject.detail === 'Not found.') {
            postMessage('This pokemon does not exist', 'https://sickr.files.wordpress.com/2016/02/missingno.jpg');
          } else {
            postMessage('Found ' + pokemonObject.name, pokemonObject.sprites.front_default);
          }

      });
  });

  req.end();
}

/*
* Sends a get request to the MovieDB (api.themoviedb.org) to get the upcoming or now playing 
* movies. It limits the list to the top 10 most popular movies in each respective category.
* 
* @param requestType type of request to send to the MovieDB API (currently supports upcoming and now_playing)
*/
function moviesAPI(requestType){
  var req, chunks, botResponse, textResult, jsonResult, total, i;

  const options = {
    "method": "GET",
    "hostname": "api.themoviedb.org",
    "port": null,
    "path": "/3/movie/" + requestType + "?region=US&page=1&language=en-US&api_key=12ba888193247c7cd0bf90ddfd87a29b",
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
      //console.log('json object:    ' + textResult.toString());
      
      botResponse = '';

      jsonResult = JSON.parse(textResult).results;

      total = (jsonResult.length < 11) ? jsonResult.length : 10;

      for(i = 0; i < total ; i += 1) {
        postMessage(jsonResult[i].title + ' – ' + jsonResult[i].vote_average + '/10', 'https://image.tmdb.org/t/p/w300/' + jsonResult[i].poster_path)
      }

    });
  });

  req.write("{}");
  req.end();
}

/*
* Sends a post request to the groupe me api. This is what the "bot" sends to the group based off
* reading the message commands. 
*
* @param botResponse Text response
* @param imageURL url of image if image posts are made 
*/

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