var _ = require('underscore');
var should = require('chai').should();
var expect = require('chai').expect;

var nox = require('../');

describe('zombies', () => {
   describe.only('tutorial',()=>{
      describe('zombies1',()=>{
         it('should just load the two requirements',(done)=>{
            var z = require('../zombies/zombies1');
            expect(z).to.exist;
            done();
         });
      });

      describe('zombies2',()=>{
         it('should create a tmplate and a spec',(done)=>{
            var z = require('../zombies/zombies2');
            expect(z).to.exist;
            expect(z.zombieSpec).to.exist;
            expect(z.zombieTemplate).to.exist;
            nox.isTemplate(z.zombieTemplate).should.equal(true);
            done();
         });
      });

      describe('zombies3',()=>{
         it('should create a series of zombies',(done)=>{
            var z = require('../zombies/zombies3');
            expect(z).to.exist;
            expect(z.zombieSpec).to.exist;
            expect(z.zombieTemplate).to.exist;
            nox.isTemplate(z.zombieTemplate).should.equal(true);
            expect(z.zombies).to.exist;
            z.zombies.length.should.equal(10);
            _.each(z.zombies,(zombie)=>{
               zombie.xp.should.equal(zombie.hp*1.5);
            });
            done();
         });
      });

      describe('zombies4',()=>{
         it('should create zombies with integer hp',(done)=>{
            var z = require('../zombies/zombies4');
            expect(z).to.exist;
            expect(z.zombieSpec).to.exist;
            expect(z.zombieTemplate).to.exist;
            nox.isTemplate(z.zombieTemplate).should.equal(true);
            expect(z.zombies).to.exist;
            z.zombies.length.should.equal(10);
            _.each(z.zombies,(zombie)=>{
               zombie.xp.should.equal(zombie.hp*1.5);
            });
            done();
         });
      });

      describe('zombies5',()=>{
         it('should create zombies with a type in array form',(done)=>{
            var z = require('../zombies/zombies5');
            expect(z).to.exist;
            expect(z.zombieSpec).to.exist;
            expect(z.zombieTemplate).to.exist;
            nox.isTemplate(z.zombieTemplate).should.equal(true);
            expect(z.zombies).to.exist;
            z.zombies.length.should.equal(10);
            _.each(z.zombies,(zombie)=>{
               zombie.xp.should.equal(zombie.hp*1.5);

               _.contains(['walker','romeo','foxtrot'],zombie.type[0]).should.equal(true);
            });
            done();
         });
      });

      describe('zombies6',()=>{
         it('should create zombies with a type',(done)=>{
            var z = require('../zombies/zombies6');
            expect(z).to.exist;
            expect(z.zombieSpec).to.exist;
            expect(z.zombieTemplate).to.exist;
            nox.isTemplate(z.zombieTemplate).should.equal(true);
            expect(z.zombies).to.exist;
            z.zombies.length.should.equal(10);
            _.each(z.zombies,(zombie)=>{
               zombie.xp.should.equal(zombie.hp*1.5);
               _.contains(['walker','romeo','foxtrot'],zombie.type).should.equal(true);
            });
            done();
         });
      });

      describe('zombies7',()=>{
         it('should create zombies with a type based on probability',(done)=>{
            var z = require('../zombies/zombies7');
            expect(z).to.exist;
            expect(z.zombieSpec).to.exist;
            expect(z.zombieTemplate).to.exist;
            nox.isTemplate(z.zombieTemplate).should.equal(true);
            expect(z.zombies).to.exist;
            z.zombies.length.should.equal(10);
            _.each(z.zombies,(zombie)=>{
               zombie.xp.should.equal(zombie.hp*1.5);
               _.contains(['walker','romeo','foxtrot'],zombie.type).should.equal(true);
            });
            done();
         });
      });





   });

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
