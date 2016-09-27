"use strict";

var should = require('chai').should();
var expect = require('chai').expect;

var lcg_rnd = require('lcg-rnd');

var nox = require('../');

describe('nox.rnd', () => {
   describe('- basic uasge : ', (done) => {
      var c = nox.rnd({
         min: 1,
         max: 6,
      });

      it('should set the _noxMethod flag', (done) => {
         c._noxMethod.should.equal(true);
         done();
      });

      it('should set the _noxErrors flag', (done) => {
         c._noxErrors.should.be.a('array');
         c._noxErrors.length.should.equal(0);
         done();
      });

      it('should store the min and max values in the relevant properties', (done) => {
         c.min.should.equal(1);
         c.max.should.equal(6);
         done();
      });

      var d = nox.rnd({
         max: 20,
      });

      it('should set the min default to 0', (done) => {
         d.min.should.equal(0);
         done();
      });

      it('should set the normal flag to false (default is a flat distribution)', (done) => {
         d.normal.should.equal(false);
         done();
      });

      it('should return the value when it is run', (done) => {
         lcg_rnd._fixRandomValue(1);
         var cResult = c.run();
         cResult.should.equal(6);
         done();
      });
   });

   describe('- recursive usage : ', () => {
      var c = nox.rnd({
         min: 15,
         max: nox.const({
           value: 20,
         }),
      });

      it('should set the _noxMethod flag on the levels', (done) => {
         c._noxMethod.should.equal(true);
         c.max._noxMethod.should.equal(true);
         done();
      });

      it('should set the _noxErrors flag', (done) => {
         c._noxErrors.should.be.a('array');
         c._noxErrors.length.should.equal(0);
         c.max._noxErrors.should.be.a('array');
         c .max._noxErrors.length.should.equal(0);
         done();
      });

      it('should set the value of the lowest level value', (done) => {
         c.max.value.should.equal(20);
         done();
      });

      it('should return the value when it is run', (done) => {
         lcg_rnd._fixRandomValue(0);
         var cResult = c.run();
         cResult.should.equal(15);
         done();
      });
   });


   describe('- error conditions :', () => {
      var c = nox.rnd({});
      var cResult = c.run();

      it('should return an error list if the required fields (value) is not specified', (done) => {
         cResult.should.be.a('Array');
         cResult.length.should.equal(1); // All the other vaues are defaulted
         done();
      });

      it('should return a usable error message', (done) => {
         cResult[0].should.equal("Required field [max] is missing.");
         done();
      });
   });

   describe('- statistical measures - flat distribution : ', () => {
      var c = nox.rnd({
         min: 0.5,
         max: 1.25,
      });

      it('should return the minimum on a random 0', (done) => {
         lcg_rnd._fixRandomValue(0);
         var r = c.run();
         r.should.equal(0.5);
         done();
      });

      it('should return the maximum on a random 1', (done) => {
         lcg_rnd._fixRandomValue(1);
         var r = c.run();
         r.should.equal(1.25);
         done();
      });

      it('should return the mid value on a random .5', (done) => {
         lcg_rnd._fixRandomValue(.5);
         var r = c.run();
         r.should.equal(0.5 + (1.25-0.5)/2);
         done();
      });

   });

   describe('- statistical measures - normal distribution : ', () => {
      var c = nox.rnd({
         min: -3.5,
         max: 99,
         normal: true,
      });

      it('should return the minimum on a random 0', (done) => {
         lcg_rnd._fixRandomValue(0);
         var r = c.run();
         r.should.equal -3.5;
         done();
      });

      it('should return the maximum on a random 1', (done) => {
         lcg_rnd._fixRandomValue(.5);
         var r = c.run();
         r.should.equal(99);
         done();
      });

      it('should return the mid value on a random .5', (done) => {
         lcg_rnd._fixRandomValue(.5);
         var r = c.run();
         r.should.equal -3.5 + (99+3.5)/2;
         done();
      });
   });
});
