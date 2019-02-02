var fs = require('fs');

var data = {
  idArray: []
};

fs.writeFileSync('sentPokemon.json', JSON.stringify(data));
