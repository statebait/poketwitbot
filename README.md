# PokeTwitBot - A twitter bot

## Description

A Simple Twitter Bot built using the [twit](https://github.com/ttezel/twit) Twitter API Client and the [PokeAPI](https://pokeapi.co/). The bot tweets about a pokemon everyday.

## Installation

**1. Ensure that Node.js and yarn have been installed**

- [Node](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)

**2. Clone the repo**

```bash
git clone https://github.com/shadxx7/poketwitbot.git
```

**3. Install Dependencies**

```bash
cd poketwitbot # Go to the project root directory
yarn
```

**4. Create the Environment File**

In the project root directory create a file called `.env` which contains your twitter app's access keys and tokens. The file should look like this:

```bash
CONSUMER_KEY = ''
CONSUMER_SECRET = ''
ACCESS_TOKEN = ''
ACCESS_TOKEN_SECRET = ''
```

**5. Run the bot**

Run the following:

```bash
cd poketwitbot # Go to the project root directory, if not already
yarn start
```

## License

This project is licensed under the MIT License - Copyright (c) 2019 Mohamed Shadab
