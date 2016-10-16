var _ = require('underscore');
var nox = require('../');

var zombieSpec = {
  hp: nox.rnd({min:10,max:20}),
  xp: nox.method({method: (o)=>{return(o.hp*1.5);}})
};
var zombieTemplate = nox.createTemplate("Zombie",zombieSpec);
var zombies = _.map(_.range(10),(i) => {
  return nox.constructTemplate("Zombie");
});

_.each(zombies,(zombie)=>{
   console.log(nox.deNox(zombie));
});

// For testing
module.exports = {
   zombieSpec: zombieSpec,
   zombieTemplate: zombieTemplate,
   zombies: zombies,
};
