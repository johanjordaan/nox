"use strict";

var should = require('chai').should();
var expect = require('chai').expect;

var nox = require('../');
var deepCompare = require('../deepCompare');

describe('nox.serialise', () => {
   describe(', when serialising a noxObject',()=>{
      var t = nox.createTemplate('t',{
         val: nox.rnd({max:20})
      });
      var o = nox.constructTemplate(t);

      it('should save only the template hash and seed values',(done) => {
         console.log(o);
         var so = nox.serialise(o);
         console.log("---------->");
         console.log(so);


         so._nox.should.exist;
         so._nox.templateName.should.exist;
         so._nox.seed.should.exist;
         so._nox.hash.should.exist;

         so._nox.templateName.should.equal(o._nox.templateName);
         so._nox.seed.should.equal(o._nox.seed);
         so._nox.hash.should.equal(o._nox.hash);

         done();
      });



   });
});
