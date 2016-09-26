"use strict";

var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('underscore');

var deepCompare = require('../deepCompare');

describe('deepCompare', () => {
   describe("comparing strings", () => {
      it('should detect string differences', (done) => {
         deepCompare("A","B").should.equal(false);
         done();
      });
      it('should detect type differences', (done) => {
         deepCompare("A",10).should.equal(false);
         done();
      });
      it('should detect string equality', (done) => {
         deepCompare("A","A").should.equal(true);
         done();
      });
   });

   describe("comparing numbers", () => {
      it('should detect number differences', (done) => {
         deepCompare(10.84,-2).should.equal(false);
         done();
      });
      it('should detect type differences', (done) => {
         deepCompare(9.88,"9.88").should.equal(false);
         done();
      });
      it('should detect number equality', (done) => {
         deepCompare(67.99,67.99).should.equal(true);
         done();
      });
   });

   describe("comparing booleans", () => {
      it('should detect boolean differences', (done) => {
         deepCompare(true,false).should.equal(false);
         done();
      });
      it('should detect type differences', (done) => {
         deepCompare(true,{}).should.equal(false);
         done();
      });
      it('should detect boolean equality', (done) => {
         deepCompare(false,false).should.equal(true);
         done();
      });
   });

   describe("comparing functions", () => {
      it('should detect function differences', (done) => {
         deepCompare(_.isString,_.isObject).should.equal(false);
         done();
      });
      it('should detect type differences', (done) => {
         deepCompare(deepCompare,[]).should.equal(false);
         done();
      });
      it('should detect function equality', (done) => {
         deepCompare(deepCompare,deepCompare).should.equal(true);
         done();
      });
   });

   describe("comparing arrays", () => {
      it('should detect array differences (length)', (done) => {
         deepCompare([1,2,3,4],[1,2,3]).should.equal(false);
         done();
      });
      it('should detect array differences (content)', (done) => {
         deepCompare([3,2,1],[1,2,3]).should.equal(false);
         done();
      });
      it('should detect array differences (content types)', (done) => {
         deepCompare(["1",2,3],[1,2,3]).should.equal(false);
         done();
      });
      it('should detect array differences (types)', (done) => {
         deepCompare(["1",2,3],{}).should.equal(false);
         done();
      });
      it('should detect array equality', (done) => {
         deepCompare([1,2,3],[1,2,3]).should.equal(true);
         done();
      });
   });

   describe("comparing objects", () => {
      it('should detect object differences (content)', (done) => {
         deepCompare({name:"Johan"},{name:"Jordaan"}).should.equal(false);
         done();
      });
      it('should detect object differences (keys)', (done) => {
         deepCompare(
            {name:"Johan"},
            {name:"Johan",surname:"Jordaan"}
         ).should.equal(false);
         done();
      });
      it('should detect object differences (content types)', (done) => {
         deepCompare(
            {name:"Johan",age:600},
            {name:"Johan",age:"600"}
         ).should.equal(false);
         done();
      });
      it('should detect object differences (types)', (done) => {
         deepCompare({},[1,2,3]).should.equal(false);
         done();
      });
      it('should detect object equality', (done) => {
         deepCompare({name:"Johan"},{name:"Johan"}).should.equal(true);
         done();
      });
   });

});
