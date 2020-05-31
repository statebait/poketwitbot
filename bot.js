const axios = require("axios");
const fs = require("fs");
const twit = require("twit");
const cheerio = require("cheerio");

// Loading vars into the environment from .env
require("dotenv").config();

//Function to Capitalize the first letter of a string
const capSize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const createTweetData = ({
  name,
  types,
  height,
  weight,
  abilities,
  description,
  path,
}) => {
  return {
    firstTweetContent: `Today's Pokemon is ${capSize(name)}!\n\n${description}`,
    secondTweetContent: `@${
      process.env.TWITTER_USERNAME
    } Here is some more info about it:\n\nTypes - ${types.reduce(
      (acc, item, index) => {
        if (index === types.length - 1) return acc + capSize(item.type.name);
        return acc + capSize(item.type.name) + ", ";
      },
      ""
    )}\nHeight - ${height * 10} cm\nWeight - ${
      weight / 10
    } kg\nAbilities - ${abilities.reduce((acc, item, index) => {
      if (index === abilities.length - 1)
        return acc + capSize(item.ability.name);
      return acc + capSize(item.ability.name) + ", ";
    }, "")}`,
    imagePath: path,
  };
};

//Function to get the data of the pokemon from the poke api
const getPokemonData = async function (id) {
  return await axios
    .get(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    .then(({ data }) => {
      return {
        name: data.name,
        types: data.types,
        height: data.height,
        weight: data.weight,
        abilities: data.abilities,
      };
    })
    .catch((err) => console.error(err));
};

//Function to get the pokemon's image and description by scraping www.pokemon.com
const getPokemonImageAndDescription = async function (pokemonName) {
  return await axios
    .get(`https://www.pokemon.com/us/pokedex/${pokemonName}`)
    .then(async (res) => {
      const $ = cheerio.load(res.data);
      const imageUrl = $(".profile-images").children("img").attr("src");
      const description = cheerio.text($(".version-y"));
      return await axios
        .get(imageUrl, {
          responseType: "arraybuffer",
        })
        .then((response) => {
          const data = new Buffer.from(response.data, "binary");
          return fs.writeFileSync("/tmp/temp.png", data);
        })
        .then(() => {
          return { description: description.trim(), path: "/tmp/temp.png" };
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const fireTweet = async function (tweetData) {
  const twitter = new twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  });

  const b64content = fs.readFileSync(tweetData.imagePath, {
    encoding: "base64",
  });

  try {
    const { data } = await twitter.post("media/upload", {
      media_data: b64content,
    });
    const mediaIdStr = data.media_id_string;
    const altText = `Supposed to be an image of ${tweetData.name}`;
    const meta_params = {
      media_id: mediaIdStr,
      alt_text: { text: altText },
    };
    await twitter.post("media/metadata/create", meta_params);

    const params = {
      status: tweetData.firstTweetContent,
      media_ids: [mediaIdStr],
    };
    const tweet = await twitter.post("statuses/update", params);
    await twitter.post("statuses/update", {
      status: tweetData.secondTweetContent,
      in_reply_to_status_id: tweet.data.id_str,
    });
  } catch (err) {
    return err;
  }
};

async function main(id) {
  try {
    const pokemonData = await getPokemonData(id);
    const tweetData = createTweetData({
      ...pokemonData,
      ...(await getPokemonImageAndDescription(pokemonData.name)),
    });
    await fireTweet(tweetData);
    return { success: true, message: "Successfully tweeted." };
  } catch (err) {
    return { error: true, message: "Something went wrong." };
  }
}

module.exports = main;
