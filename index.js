var axios = require('axios');
var fs = require('fs');
var Chance = require('chance');
var _ = require('lodash');
var schedule = require('node-schedule');

var temp = [];

function capSize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

async function getUniqueRandomNo(temp, count) {
  var chance = new Chance();
  var randomNo = chance.integer({ min: 1, max: 802 });
  if (count === 802) {
    return 'Max Limit Reached';
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

function firePokeTweet(id) {
  var twit = require('twit');
  var config = require('./config.js');
  var twitter = new twit(config);
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
      console.log('Log: firePokeTweet -> content\n', content);
      twitter.post(
        'statuses/update',
        {
          status: content
        },
        function(err, data, response) {
          if (err) {
            console.log('Caught Error', err.stack);
          }
        }
      );
    })
    .catch(function(error) {
      console.log(error);
    });
}

async function checkUnique(id) {
  var data = await fs.readFileSync('sentPokemon.json');
  var jsonData = JSON.parse(data);
  var arrayData = jsonData.idArray;
  if (arrayData.includes(id)) {
    return false;
  } else {
    var newData = { idArray: [...arrayData, id] };
    var newJsonData = JSON.stringify(newData);
    await fs.writeFileSync('sentPokemon.json', newJsonData);
    return true;
  }
}

async function main() {
  var count = 0;
  var pokemonID = await getUniqueRandomNo(temp, count);
  firePokeTweet(pokemonID);
}

schedule.scheduleJob('* * */1 * *', () => {
  main();
});
