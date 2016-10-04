var _ = require('underscore');
var should = require('chai').should();
var expect = require('chai').expect;

var nox = require('../');
var deepCompare = require('../deepCompare');

var checkObject = (o) => {
   _.keys(o).length.should.equal(1);
   _.keys(o)[0].should.equal("_nox");

   o._nox.should.exist;
   o._nox.templateName.should.exist;
   o._nox.seed.should.exist;
   o._nox.hash.should.exist;

   o._nox.templateName.should.equal(o._nox.templateName);
   o._nox.seed.should.equal(o._nox.seed);
   o._nox.hash.should.equal(o._nox.hash);
};

describe('nox.serialise', () => {
   describe(', when serialising a noxObject',()=>{
      var t = nox.createTemplate('txce',{
         val: nox.rnd({max:20}),
         arr: [nox.rnd({max:nox.rnd({max:100})}),nox.rnd({max:6}),nox.rnd({max:6})],
      });
      var o = nox.constructTemplate(t);
      var so = nox.serialise(o);

      it('should save only the template hash and seed values',(done) => {
         checkObject(so);
         done();
      });

      it('should restore the serialised object exactly',(done) =>{
         var dso = nox.deserialise(so);
         deepCompare(dso,o).should.equal(true);
         done();
      });


   });
});
