"use strict";

var _ = require('underscore');
var should = require('chai').should();
var expect = require('chai').expect;

var test_utils = require("./test_utils");
var nox = require('../');

describe('nox.select', () => {
    describe('- basic usage (select from non-template(list);) flat distribution : ', () => {
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

      it('should set the default count to(1);', (done) => {
         c.count.should.equal(1);
         done();
      });

      it('should set the deafult return_one flag to(false);', (done) => {
         c.returnOne.should.equal(false);
         done();
      });

      var d = nox.select({
         count: 3,
         values: list,
      });


      it('should set the count to(3);', (done) => {
         d.count.should.equal(3);
         done();
      });

      test_utils.fixRandomValues([0,0.5,1]);
      var result = d.run();

      it('should return a result with length of(3);', (done) => {
         result.length.should.equal(3);
         done();
      });

      it('should return an array with values A,B,D based on(0);,0.5 and(1); random values', (done) => {
         var expected = ['A','B','D'];
         _.each(_.range(3), (i) => {
            result[i].should.equal(expected[i]);
         });
         done();
      });

      var e = nox.selectOne({
         values: list,
      },true);

      it('should set the default returnOne flag to true if using selectOne', (done) => {
         e.returnOne.should.equal(true);
         done();
      });

      it('should select a single item from the(list); (not as an array)', (done) => {
         test_utils.fixRandomValue(0.7);
         e.run().should.equal('C');
         done();
      });
   });

   describe('- basic usage (select from(list); of templates, the templates must be constructed) flat distribution', () => {
      var male = nox.createTemplate('male', {
         name : nox.selectOne({
            values : ['John','Joe','Peter']
         }),
      });

      var female = nox.createTemplate('female', {
         name : nox.selectOne({
            values : ['Jane','Sue','Sandra','Ruth']
         }),
      });

      var alien = nox.createTemplate('alien', {
         name : nox.selectOne({
            values : ['Xi','Yi','Zi','Zoooo']
         }),
      });

      var a = nox.select({
         count: 2,
         values: [alien,female,male],
      });

      test_utils.fixRandomValues [1,0.5,0.5,1];
      var result = a.run();
      console.log(result);

      it('should return template instances based on the random numbers supplied', () => {
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

      test_utils.fixRandomValues [0.5,0.5,1];
      var result = r.run();

      it('should get the list of values from the method and select a random one from the list;', (done) => {
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
   });
});
