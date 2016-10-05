var nox = require('nox');

var zombieTemplate = {
  hp: nox.rnd({min:10,max:20}),
  xp: nox.method({method: (o)=>{return(o.hp*1.5);}})
};
nox.createTemplate("Zombie",zombieTemplate);
var zombies = _.map(_.range(10),(i) => {
  return nox.constructTemplate("Zombie");
});
