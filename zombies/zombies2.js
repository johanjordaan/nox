var _ = require('underscore');
var nox = require('../');
var zombieTemplate = {
  hp: nox.rnd({min:10,max:20}),
  xp: nox.method({method: (o)=>{return(o.hp*1.5);}})
};
nox.createTemplate("Zombie",zombieTemplate);
