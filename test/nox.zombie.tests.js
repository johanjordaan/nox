var _ = require('underscore');
var should = require('chai').should();
var expect = require('chai').expect;

var nox = require('../');

describe.only('zombies', () => {
   describe(' from the readme templates ', () =>{
      var zombieTemplate = {
      	hp: nox.rnd({min:10,max:20}),
      	xp: nox.method({method:(o)=>{return(o.hp*1.5);}})
      };
      nox.createTemplate("Zombie",zombieTemplate);

      var zombies = _.map(_.range(1000),(i) => {
         return nox.constructTemplate("Zombie");
      });

      it('should construct zombies with correct hp range', (done) => {
         _.each(zombies,(zombie) => {
            expect(zombie.hp).to.be.at.least(10);
            expect(zombie.hp).to.be.most(20);
         });
         done();
      });

      it('should construct zombies with the correct xp based on hp',(done) =>{
         _.each(zombies,(zombie)=>{
            zombie.xp.should.equal(zombie.hp*1.5);
         });
         done();
      });
   });
});
