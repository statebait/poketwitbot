const axios = require("axios");
const bot = require("../bot");
require("dotenv").config();

module.exports = async (req, res) => {
  if (req.headers["x-poketwitbot-secret"] === process.env.BOT_SECRET) {
    try {
      const airtableResponse = await axios({
        method: "GET",
        url:
          "https://api.airtable.com/v0/apphEP9nvFqyG6ORZ/pokemonTweetCount/recQuXLO81KkO2DeF",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
      });
      const pokemonId = Number(airtableResponse.data.fields.Count) + 1;
      const { error, success, message } = await bot(pokemonId);
      if (error) {
        res.status(500).send(message);
      } else if (success) {
        await axios({
          method: "PATCH",
          url:
            "https://api.airtable.com/v0/apphEP9nvFqyG6ORZ/pokemonTweetCount",
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          },
          data: {
            records: [
              {
                id: "recQuXLO81KkO2DeF",
                fields: {
                  Count: pokemonId,
                },
              },
            ],
          },
        });
        res.status(200).send(message);
      }
    } catch (err) {
      res
        .status(500)
        .send(
          `Something went wrong. More info on what went wrong internally: ${err.toString()}`
        );
    }
  } else {
    res.status(401).send("Unauthorized.");
  }
};
