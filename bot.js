const axios = require("axios");
const fs = require("fs");
const twit = require("twit");
const _ = require("lodash");
const cheerio = require("cheerio");
require("dotenv").config();

//Function to Captilize the first letter of a string
const capSize = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

//Function to get the data of the pokemon
const getPokemonData = async function (id) {
  let content, name;
  await axios
    .get(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then((response) => {
      const data = response.data;
      name = data.name;
      content = `Today's Pokemon is ${capSize(
        data.name
      )}!\n\nHere is some info about it:\n\nTypes - ${_.map(
        data.types,
        (item) => {
          return capSize(item.type.name);
        }
      )}\nHeight - ${data.height}\nWeight - ${data.weight}\nAbilities - ${_.map(
        data.abilities,
        (item) => {
          return capSize(item.ability.name);
        }
      )}`;
    })
    .catch((err) => console.error(err));

  return { content, name };
};

//Function to get the pokemons image
const getImageAndTweet = async function (stuff) {
  await axios
    .get(`https://www.pokemon.com/us/pokedex/${stuff.name}`)
    .then(async (res) => {
      const $ = cheerio.load(res.data);
      const imageUrl = $(".profile-images").children("img").attr("src");
      await axios
        .get(imageUrl, {
          responseType: "arraybuffer",
        })
        .then((response) => {
          const data = new Buffer.from(response.data, "binary");
          return fs.writeFileSync("/tmp/temp.png", data);
        })
        .then(async () => {
          await fireTweet(stuff);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const fireTweet = async function (stuff) {
  const twitter = new twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const b64content = fs.readFileSync("/tmp/temp.png", { encoding: "base64" });

  try {
    const { data } = await twitter.post("media/upload", {
      media_data: b64content,
    });
    const mediaIdStr = data.media_id_string;
    const altText = `Supposed to be an image of ${stuff.name}`;
    const meta_params = {
      media_id: mediaIdStr,
      alt_text: { text: altText },
    };
    await twitter.post("media/metadata/create", meta_params);

    const params = {
      status: stuff.content,
      media_ids: [mediaIdStr],
    };
    await twitter.post("statuses/update", params);
  } catch (err) {
    return err;
  }
};

async function main(id) {
  try {
    const data = await getPokemonData(id);
    await getImageAndTweet(data);
    return { success: true, message: "Successfully tweeted." };
  } catch (err) {
    return { error: true, message: "Something went wrong." };
  }
}

module.exports = main;
