"use strict";

var _ = require('underscore');
var should = require('chai').should();
var expect = require('chai').expect;

var nox = require('../');

var testMethod = (o) => {
   return 'Hallo';
};

describe('nox.method', () => {
   describe('- basic uasge : ', () => {
      var c = nox.method({method : testMethod});

      it('should set the _noxMethod flag', (done) => {
         c._nox.method.should.equal(true);
         done();
      });

      it('should set the _noxErrors flag', (done) => {
         c._nox.errors.should.be.a('array');
         c._nox.errors.length.should.equal(0);
         done();
      });


      it('should store the value in the value variable', (done) => {
         c.method.should.be.a('function');
         c.method.should.equal(testMethod);
         done();
      });


      it('should return the value from the method when it is run', (done) => {
         var cResult = c.run();
         cResult.should.equal("Hallo");
         done();
      });

   });

   describe('- recursive usage : ', () => {
      var c = nox.method({
         method : nox.const({
            value : testMethod
         })
      });

      it('should set the _noxMethod flag on the levels', (done) => {
         c._nox.method.should.equal(true);
         c.method._nox.method.should.equal(true);
         done();
      });

      it('should set the correct method field', (done) => {
         c.method.should.be.a('object');
         c.method.value.should.be.a('function');
         c.method.value.should.equal(testMethod);
         done();
      });

      it('should return the result of the method when it is run', (done) => {
         var cResult = c.run();
         cResult.should.equal("Hallo");
         done();
      });

   });

   describe('- error conditions :', (done) => {
      var c = nox.method({});
      var cResult = c.run();

      it('should return an error list if the required fields (value) is not specified', (done) => {
         cResult.should.be.a('Array');
         cResult.length.should.equal(1);
         done();
      });

      it('should return a usable error message', (done) => {
         cResult[0].should.equal("Required field [method] is missing.");
         done();
      });

   });
});
