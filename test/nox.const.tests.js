"use strict";

var should = require('chai').should();
var expect = require('chai').expect;

var nox = require('../');

describe('nox.const', () => {
   describe(', with embedded templates ', () =>{
      var t1 = nox.createTemplate("t1",{val: [nox.const({value:"Some value"})]});
      var t2 = nox.createTemplate("t2",{nickname: nox.const({value:"Some Other?"})});
      var tx = nox.createTemplate("tw",{x: t1,y: "t2"});

      var result = nox.constructTemplate(tx);
      it('should construct the referenced templates', (done) => {
         result.x.should.exist;
         result.x.val.should.be.a("array");
         result.x.val.length.should.equal(1);
         result.x.val[0].should.equal("Some value");
         result.y.should.exist;
         result.y.nickname.should.equal("Some Other?");
         done();
      });

   });


   describe('- basic usage : ', () => {
      var c = nox.const({ value : 10});

      it('should set the _noxMethod flag', (done) => {
         c._nox.method.should.equal(true);
         done();
      });

      it('should set the _nox_errors flag', (done) => {
         c._nox.errors.should.be.a('array');
         c._nox.errors.length.should.equal(0);
         done();
      });

      it('should store the value in the value variable', (done) => {
         c.value.should.equal(10);
         done();
      });

      it('should return the value when it is run', (done) => {
         var cResult = c.run();
         cResult.should.equal(10);
         done();
      });
   });


   describe('- recursive usage : ', () => {
      var c = nox.const({
         value : nox.const({
            value : nox.const({
               value : 20
            })
         })
      });

      it('should set the _noxMethod flag on the levels', (done) => {
         c._nox.method.should.equal(true);
         c.value._nox.method.should.equal(true);
         c.value.value._nox.method.should.equal(true);
         done();
      });

      it('should set the value of the lowest level value', (done) => {
         c.value.value.value.should.equal(20);
         done();
      });

      it('should return the value when it is run', (done) => {
         var cResult = c.run();
         cResult.should.equal(20);
         done();
      });

   });

   describe('- error conditions :', () => {
      var c = nox.const({});
      var cResult = c.run();


      it('should return an error list if the required fields value is not specified', (done) => {
         cResult.should.be.a('Array');
         cResult.length.should.equal(1);
         done();
      });

      it('should return a usable error message', (done) => {
         cResult[0].should.equal("Required field [value] is missing.");
         done();
      });
   });
});
