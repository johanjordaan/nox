"use strict";

var should = require('chai').should();
var expect = require('chai').expect;

var nox = require('../');

describe('nox.const', () => {
   describe('- basic usage : ', () => {
      var c = nox.const({ value : 10});

      it('should set the _noxMethod flag', (done) => {
         c._noxMethod.should.equal(true);
         done();
      });

      it('should set the _nox_errors flag', (done) => {
         c._noxErrors.should.be.a('array');
         c._noxErrors.length.should.equal(0);
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
         c._noxMethod.should.equal(true);
         c.value._noxMethod.should.equal(true);
         c.value.value._noxMethod.should.equal(true);
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
