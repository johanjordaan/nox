var _ = require('underscore');
var nox = require('../');

var walkerDef = {
   mod: 1.5,
   hp: nox.rnd.int({min:10,max:20}),
   xp: nox.method({method: (o)=>{return(o.hp*o.mod);}}),
   type: 'walker'
};
var walkerTemplate = nox.createTemplate("walker_",walkerDef);

var romeoDef = {
   hp: nox.rnd.int({ min:30,max:50 }),
   mod: 2,
   type: 'romeo'
};
var romeoTemplate = nox.extendTemplate(walkerTemplate,"romeo_",romeoDef);

var foxtrotDef = {
  hp: nox.rnd.int({min:80,max:150}),
  mod: 3,
  type: 'foxtrot'
};
var foxtrotTemplate = nox.extendTemplate(walkerTemplate,"foxtrot_",foxtrotDef);

var zombieSwarmDef = {
   zombies: nox.select({
      count: nox.rnd({min:5,max:15}),
      values:[
         {probability:.6, item:walkerTemplate},
         {probability:.3, item:romeoTemplate},
         {probability:.1, item:foxtrotTemplate},
      ]}),
};

nox.createTemplate("zombieSwarm",zombieSwarmDef);
var zombieSwarm = nox.constructTemplate("zombieSwarm");

_.each(zombieSwarm.zombies,(zombie)=>{
   console.log(nox.deNox(zombie));
});

module.exports = zombieSwarm;
