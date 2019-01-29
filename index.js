var axios = require('axios');

function firePokeTweet() {
  // while (keepGoing) {
  var twit = require('twit');
  var config = require('./config.js');
  var twitter = new twit(config);
  axios
    .get('https://pokeapi.co/api/v2/pokemon/ditto/')
    .then(function(response) {
      console.log(response.data);
      // twitter.post(
      //   'statuses/update',
      //   {
      //     status: content
      //   },
      //   function(err, data, response) {
      //     if (err) {
      //       console.log('Caught Error', err.stack);
      //     }
      //   }
      // );
    })
    .catch(function(error) {
      console.log(error);
    });
  // }
}

firePokeTweet();
