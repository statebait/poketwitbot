# PokeTwitBot - A twitter bot

## Description

A Simple Twitter Bot built using the [twit](https://github.com/ttezel/twit) Twitter API Client and the [PokeAPI](https://pokeapi.co/) (and a little bit of web scraping from https://www.pokemon.com). The bot will tweet about a pokemon.

## Installation & Usage

> The `api` folder in this repo is for the serverless API setup using [Zeit(Vercel)](https://vercel.com/). It uses an [Airtable](https://airtable.com/invite/r/GPY1lsA0) config for storing which pokemons have been tweeted and uses a cron job service like [EasyCron](https://www.easycron.com/?ref=167187) to hit this API everyday.

**1. Ensure that Node.js and yarn have been installed**

- [Node](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

**2. Clone the repo**

```bash
git clone https://github.com/statebait/poketwitbot.git
```

**3. Install Dependencies**

```bash
cd poketwitbot # Go to the project root directory
yarn
```

**4. Create the Environment File**

In the project root directory create a file called `.env` which contains your twitter app's access keys and tokens. The file should look like this:

```bash
TWITTER_USERNAME=
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
```

**5. Run the bot**

To run the bot you will need to import/require the bot.js file in your script, function or whatsoever like this:

```js
const bot = require("./path/to/bot.js");

async function main() {
  const { success, error, message } = await bot(250); // Pass in any pokemon id as the argument (pokemon id is the pokemon no. in the pokedex
  if (err) {
    console.error(message);
  } else if (success) {
    console.log(message);
  }
}
```

## License

This project is licensed under the MIT License - Copyright (c) 2020 Mohamed Shadab
