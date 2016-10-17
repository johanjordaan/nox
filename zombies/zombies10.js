var _ = require('underscore');
var nox = require('../');

var walkerSpec = {
   mod: 1.5,
   hp: nox.rnd.int({min:10,max:20}),
   xp: nox.method({method: (o)=>{return(o.hp*o.mod);}}),
   type: 'walker'
};
var walkerTemplate = nox.createTemplate("walker_",walkerSpec);

var romeoSpec = {
   hp: nox.rnd.int({ min:30,max:50 }),
   mod: 2,
   type: 'romeo'
};
var romeoTemplate = nox.extendTemplate(walkerTemplate,"romeo_",romeoSpec);

var foxtrotSpec = {
  hp: nox.rnd.int({min:80,max:150}),
  mod: 3,
  type: 'foxtrot'
};
var foxtrotTemplate = nox.extendTemplate(walkerTemplate,"foxtrot_",foxtrotSpec);

var zombieSwarmSpec = {
   zombies: nox.select({
      count: nox.rnd({min:5,max:15}),
      values:[
         {probability:.6, item:walkerTemplate},
         {probability:.3, item:romeoTemplate},
         {probability:.1, item:foxtrotTemplate},
      ]}),
};

var zombieSwarmTemplate = nox.createTemplate("ZombieSwarm",zombieSwarmSpec);
var zombieSwarm = nox.constructTemplate("ZombieSwarm");

_.each(zombieSwarm.zombies,(zombie)=>{
   console.log(nox.deNox(zombie));
});

module.exports = {
   walkerSpec: walkerSpec,
   romeoSpec: romeoSpec,
   foxtrotSpec: foxtrotSpec,

   walkerTemplate: walkerTemplate,
   romeoTemplate: romeoTemplate,
   foxtrotTemplate: foxtrotTemplate,

   zombieSwarmSpec: zombieSwarmSpec,
   zombieSwarmTemplate: zombieSwarmTemplate,

   zombieSwarm: zombieSwarm,
};
