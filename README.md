# C-3PO (GroupMe Bot)

## Set-Up
This GroupMe bot is hosted on heroku and runs on NodeJS. I started this from the existing [GroupMe NodeJS Callback Bot Tutorial](https://github.com/groupme/bot-tutorial-nodejs).

I had some cloning issues, so I followed [this StackOverflow Answer](http://stackoverflow.com/questions/18751063/trying-to-heroku-gitclone-after-heroku-fork-yields-an-empty-repository) to fix that.



## What does this Bot do?

This bot takes commands from in the form of `/<command name>`. The current commands supported are 
`/movies now playing`, `/movies upcoming`, and `/pokemon <pokemon name/number here>`. If an unimplemented command (`/<random command here>`) is used then a message will tell you to use a different command.


### /movies now playing or /movies upcoming
This uses the [Movie DB API](https://developers.themoviedb.org/4/getting-started) to get what movies are now playing or upcoming. The api sorts the movies by popularity and the bot chats top 10 most popular movies now playing or upcoming.

### /pokemon <pokemon name/number here>
This uses the [Pokeapi](http://pokeapi.co/) to get a pokemon based off its name or number. It gives Missingno if the pokemon is not valid. 

### Possible next steps
Spit out random Star Wars facts (It is C-3PO after all).