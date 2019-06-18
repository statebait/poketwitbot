const axios = require("axios");
const fs = require("fs");
const twit = require("twit");
const _ = require("lodash");
const cheerio = require("cheerio");
const CronJob = require("cron").CronJob;
require("dotenv").config();

//Function to generate count.json if not already generated
exports.getCount = function() {
  if (!fs.existsSync("./count.json")) {
    const data = {
      count: 2
    };
    fs.writeFileSync("./count.json", JSON.stringify(data));
    return 1;
  } else {
    const data = JSON.parse(fs.readFileSync("./count.json"));
    const newData = { count: data.count + 1 };
    fs.writeFileSync("./count.json", JSON.stringify(newData));
    return data.count;
  }
};

//Function to Captilize the first letter of a string
exports.capSize = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

//Function to get the data of the pokemon
exports.getPokemonData = async function(id) {
  const { capSize } = module.exports;
  let content, name;
  await axios
    .get(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then(response => {
      const data = response.data;
      name = data.name;
      content = `Today's Pokemon is ${capSize(
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
    })
    .catch(err => console.error(err));

  return { content, name };
};

//Function to get the pokemons image
exports.getImageAndTweet = function(stuff) {
  const { fireTweet } = module.exports;
  axios
    .get(`https://www.pokemon.com/us/pokedex/${stuff.name}`)
    .then(res => {
      const $ = cheerio.load(res.data);
      const imageUrl = $(".profile-images")
        .children("img")
        .attr("src");
      axios
        .get(imageUrl, {
          responseType: "arraybuffer"
        })
        .then(response => {
          const data = new Buffer.from(response.data, "binary");
          return fs.writeFileSync("./temp.png", data);
        })
        .then(() => {
          fireTweet(stuff);
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
};

exports.fireTweet = function(stuff) {
  const twitter = new twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

  const b64content = fs.readFileSync("./temp.png", { encoding: "base64" });
  twitter.post("media/upload", { media_data: b64content }, function(
    err,
    data,
    response
  ) {
    const mediaIdStr = data.media_id_string;
    const altText = `Supposed to be an image of ${stuff.name}`;
    const meta_params = {
      media_id: mediaIdStr,
      alt_text: { text: altText }
    };

    twitter.post("media/metadata/create", meta_params, function(
      err,
      data,
      response
    ) {
      if (!err) {
        const params = {
          status: stuff.content,
          media_ids: [mediaIdStr]
        };

        twitter.post("statuses/update", params, function(err, data, response) {
          console.log("Tweeted!\n");
        });
      }
    });
  });
};

async function main() {
  const { getCount, getPokemonData, getImageAndTweet } = module.exports;
  const id = await getCount();
  const data = await getPokemonData(id);
  getImageAndTweet(data);
}

// Create a job that runs the main function once everyday at midnight
const job = new CronJob("00 00 00 * * *", function() {
  const d = new Date();
  main();
  console.log("Executed at:", d);
});

job.start();
