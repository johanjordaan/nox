"use strict";

var _ = require('underscore');
var should = require('chai').should();
var expect = require('chai').expect;

var lcg_rnd = require('lcg-rnd');

var test_utils = require("./test_utils");
var nox = require('../');

describe('nox.select', () => {
   describe('- basic properties :',() => {
      var list = ['A','B','C','D'];
      var c = nox.select({
         values: list,
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

      it('should store values in the values property', (done) => {
         c.values.should.equal(list);
         done();
      });

      it('should set the default count to 1;', (done) => {
         c.count.should.equal(1);
         done();
      });

      it('should set the deafult returnOne flag to false', (done) => {
         c.returnOne.should.equal(false);
         done();
      });

      var c_one = nox.select.one({
         values: list,
      });

      it('should set the default count to 1;', (done) => {
         c_one.count.should.equal(1);
         done();
      });

      it('should set the default returnOne flag to true', (done) => {
         c_one.returnOne.should.equal(true);
         done();
      });


      it('should return an empty list if the count is 0 and selectOne is false', (done) => {
         var c_zero = nox.select({
            values: list,
            count: 0
         });
         var result = c_zero.run();
         expect(result).to.be.a('array');
         result.length.should.equal(0);
         done();
      });

   });

//----------------




    describe('- basic usage (select from non-template list) flat distribution : ', () => {
      var list = ['A','B','C','D'];
      var c = nox.select({
         values: list,
      });


      var d = nox.select({
         count: 3,
         values: list,
      });

      it('should set the count to 3', (done) => {
         d.count.should.equal(3);
         done();
      });


      it('should return a result with length of(3);', (done) => {
         lcg_rnd._fixRandomValues([0,0.5,1]);
         var result = d.run();
         result.length.should.equal(3);
         done();
      });

      it('should return an array with values A,B,D based on(0);,0.5 and(1); random values', (done) => {
         lcg_rnd._fixRandomValues([0,0.5,1]);
         var result = d.run();
         var expected = ['A','B','D'];
         _.each(_.range(3), (i) => {
            result[i].should.equal(expected[i]);
         });
         done();
      });

      var e = nox.select.one({
         values: list,
      },true);

      it('should set the default returnOne flag to true if using select.one', (done) => {
         e.returnOne.should.equal(true);
         done();
      });

      it('should select a single item from the(list); (not as an array)', (done) => {
         lcg_rnd._fixRandomValue(0.7);
         e.run().should.equal('C');
         done();
      });
   });

   describe('- basic usage (select from(list); of templates, the templates must be constructed) flat distribution', () => {
      var male = nox.createTemplate('male', {
         name : nox.select.one({
            values : ['John','Joe','Peter']
         }),
      });

      var female = nox.createTemplate('female', {
         name : nox.select.one({
            values : ['Jane','Sue','Sandra','Ruth']
         }),
      });

      var alien = nox.createTemplate('alien', {
         name : nox.select.one({
            values : ['Xi','Yi','Zi','Zoooo']
         }),
      });


      it('should return template instances based on the random numbers supplied', (done) => {
         var a = nox.select({
            count: 2,
            values: [alien,female,male],
         });

         lcg_rnd._fixRandomValues([1,0.5,0.5,1]);
         var result = a.run();

         result[0].name.should.equal('Joe');
         result[1].name.should.equal('Ruth');
         done();
      });
   });

   describe('- recursive usage : ', () => {
      var gen_list = () => {
         return ['X','Y','Z'];
      };

      var r = nox.select({
         count: nox.rnd({
            min: 1,
            max: 3,
         }),
         values: nox.method({
            method: gen_list,
         }),
      });


      it('should get the list of values from the method and select a random one from the list;', (done) => {
         lcg_rnd._fixRandomValues([0.5,0.5,1]);
         var result = r.run();

         result.length.should.equal(2);
         result[0].should.equal('Y');
         result[1].should.equal('Z');
         done();
      });
   });

   describe('- error conditions :', () => {
      var c = nox.select({});
      var cResult = c.run();

      it('should return an error list if the required fields values is not specified', (done) => {
         cResult.should.be.a('array');
         cResult.length.should.equal(1); // All the other vaues are defaulted
         done();
      });

      it('should return a usable error message', (done) => {
         cResult[0].should.equal("Required field [values] is missing.");
         done();
      });

      var d = nox.select({ values : []});
      var dResult = d.run();

      it('should not allow empty list as values parameter ie a list of values must have at least one value', (done) => {
         dResult.should.be.a('array');
         dResult.length.should.equal(1); // All the other vaues are defaulted
         dResult[0].should.equal("Values list should contain at least one value.");
         done();
      });

      it('should return an error message if the count is !=0 and returnOne is set', (done) =>{
         var d = nox.select({ values: [1,2,3,4,5], returnOne: true, count: 2});
         var dResult = d.run();
         dResult[0].should.equal("To select one a count of exactly 1 is required.");
         done();
      });

   });
});
