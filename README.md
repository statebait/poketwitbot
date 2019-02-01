# PokeTwitBot - A twitter bot

## Description

A Simple Twitter Bot built using the npm [twit](https://github.com/ttezel/twit) Twitter API Client and the [PokeAPI](https://pokeapi.co/). The bot tweets about a random pokemon everyday.

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

**4. Create Config File**

In the project root directory create a file `config.js` which contains your twitter app's access keys and tokens. A typical config.js file should look like this:

```javascript
//config.js

module.exports = {
  consumer_key: '', // insert consumer key (API Key)
  consumer_secret: '', // insert consumer secret (API Secret)
  access_token: '', //  insert access token
  access_token_secret: '' // insert access token secret
};
```

**5. Creating the sentPokemon.json file**

- Navigate into the directory where you have cloned the repository
- Create a new file called 'sentPokemon.json' and copy the following into it:

```json
{
  "idArray": []
}
```

**4. Run the bot**

```bash
cd poketwitbot # Go to the project root directory, if not already
yarn start
```
