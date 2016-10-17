var _ = require('underscore');
var nox = require('../');

var walkerSpec = {
  hp: nox.rnd.int({min:10,max:20}),
  xp: nox.method({method: (o)=>{return(o.hp*1.5);}}),
  type: 'walker'
};

var romeoSpec = {
  hp: nox.rnd.int({min:30,max:50}),
  xp: nox.method({method: (o)=>{return(o.hp*2);}}),
  type: 'romeo'
};

var foxtrotSpec = {
  hp: nox.rnd.int({min:80,max:150}),
  xp: nox.method({method: (o)=>{return(o.hp*3);}}),
  type: 'foxtrot'
};

var walkerTemplate = nox.createTemplate("walker_",walkerSpec);
var romeoTemplate = nox.createTemplate("romeo_",romeoSpec);
var foxtrotTemplate = nox.createTemplate("foxtrot_",foxtrotSpec);

var zombieSwarmSpec = {
   zombies: nox.select({
      count:10,
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

// For testing
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
