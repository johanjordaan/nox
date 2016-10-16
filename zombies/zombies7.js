var _ = require('underscore');
var nox = require('../');

var zombieSpec = {
  hp: nox.rnd.int({min:10,max:20}),
  xp: nox.method({method: (o)=>{return(o.hp*1.5);}}),
  type: nox.select.one({values:[
     {probability:.6, item:'walker'},
     {probability:.3, item:'romeo'},
     {probability:.1, item:'foxtrot'},
  ]}),
};
var zombieTemplate = nox.createTemplate("Zombie",zombieTemplate);
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
