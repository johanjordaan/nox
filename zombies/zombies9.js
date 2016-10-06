var _ = require('underscore');
var nox = require('../');

var walkerTemplate = {
  hp: nox.rnd.int({min:10,max:20}),
  xp: nox.method({method: (o)=>{return(o.hp*1.5);}}),
  type: 'walker'
};

var romeoTemplate = {
  hp: nox.rnd.int({min:30,max:50}),
  xp: nox.method({method: (o)=>{return(o.hp*2);}}),
  type: 'romeo'
};

var foxtrotTemplate = {
  hp: nox.rnd.int({min:80,max:150}),
  xp: nox.method({method: (o)=>{return(o.hp*3);}}),
  type: 'foxtrot'
};

var walker = nox.createTemplate("walker_",walkerTemplate);
var romeo = nox.createTemplate("romeo_",romeoTemplate);
var foxtrot = nox.createTemplate("foxtrot_",foxtrotTemplate);

var zombieSwarmTemplate = {
   zombies: nox.select({
      count: nox.rnd({min:5,max:15}),
      values:[
         {probability:.6, item:walker},
         {probability:.3, item:romeo},
         {probability:.1, item:foxtrot},
      ]}),
};

nox.createTemplate("zombieSwarm",zombieSwarmTemplate);
var zombieSwarm = nox.constructTemplate("zombieSwarm");

_.each(zombieSwarm.zombies,(zombie)=>{
   console.log(nox.deNox(zombie));
});

module.exports = zombieSwarm;
