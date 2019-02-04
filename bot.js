var axios = require("axios");
var fs = require("fs");
var Chance = require("chance");
var _ = require("lodash");
var schedule = require("node-schedule");
require("dotenv").config();

//Temporary Array for storing the different random nos generated, to avoid checking the same nos in the sentPokemon.json file
var temp = [];

//Function to generate sentPokemon.json if not already generated
function generateSentPokemon() {
  if (!fs.existsSync("sentPokemon.json")) {
    var data = {
      idArray: []
    };
    fs.writeFileSync("sentPokemon.json", JSON.stringify(data));
  }
}

//Function to Captilize the first letter of a string
function capSize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//Generates the Unique Random No which is used as the id of the Pokemon to be tweeted
async function getUniqueRandomNo(temp, count) {
  var chance = new Chance();
  var randomNo = chance.integer({ min: 1, max: 802 });
  if (count === 802) {
    return "Max Limit Reached";
  } else if (temp.includes(randomNo)) {
    count++;
    getUniqueRandomNo(temp);
  } else {
    temp.push(randomNo);
    if (await checkUnique(randomNo)) {
      return randomNo;
    } else {
      getUniqueRandomNo(temp);
    }
  }
}

//Function to tweet the Pokemon itself
function firePokeTweet(id) {
  var twit = require("twit");
  var twitter = new twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });
  //Get request to PokeAPI using axios
  axios
    .get(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then(function(response) {
      var data = response.data;
      var content = `Today's Pokemon is ${capSize(
        data.name
      )}!\n\nHere is some info about it:\n\nTypes - ${_.map(
        data.types,
        item => {
          return capSize(item.type.name);
        }
      )}\nHeight - ${data.height}\nWeight - ${data.weight}\nAbilities - ${_.map(
        data.abilities,
        item => {
          return capSize(item.ability.name);
        }
      )}`;
      console.log("Log: firePokeTweet -> content\n", content);
      //Posting the tweet
      twitter.post(
        "statuses/update",
        {
          status: content
        },
        function(err, data, response) {
          if (err) {
            console.log("Caught Error", err.stack);
          }
        }
      );
    })
    .catch(function(error) {
      console.log(error);
    });
}

//Checking the randomly generated no. against the sent pokemon in sentPokemon.json
async function checkUnique(id) {
  var data = await fs.readFileSync("sentPokemon.json");
  var jsonData = JSON.parse(data);
  var arrayData = jsonData.idArray;
  if (arrayData.includes(id)) {
    return false;
  } else {
    var newData = { idArray: [...arrayData, id] };
    var newJsonData = JSON.stringify(newData);
    await fs.writeFileSync("sentPokemon.json", newJsonData);
    return true;
  }
}

//Main Function that runs everything
async function main() {
  //Calls the generate sentPokemon.json function
  generateSentPokemon();
  var count = 0;
  var pokemonID = await getUniqueRandomNo(temp, count);
  firePokeTweet(pokemonID);
}

main();

//Schedules the main function to run once everyday
schedule.scheduleJob("0 0 * * *", () => {
  main();
});
