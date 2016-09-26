"use strict";

var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('underscore');

var deepCompare = require('../deepCompare');
var deepClone = require('../deepClone');

describe('nox.deepClone', () => {
   describe('- usage without extension or directives : ', () => {

      describe('- string cloning', () => {
         var source = "a string;";
         var clone = deepClone(source);

         it('should return a copy of a string', (done) => {
            deepCompare(source,clone).should.equal(true);
            done();
         });

         it('should not retain a ref to the original string', (done) => {
            source = "xxx";
            deepCompare(source,clone).should.equal(false);
            done();
         });
      });

      describe('- number cloning', () => {
         var source = 10.3;
         var clone = deepClone(source);

         it('should return a copy of a number', (done) => {
            deepCompare(source,clone).should.equal(true);
            done();
         });

         it('should not retain a ref to the original number', (done) => {
            source = 0.99;
            deepCompare(source,clone).should.equal(false);
            done();
         });
      });

      describe('- boolean cloning', () => {
         var source = true;
         var clone = deepClone(source);

         it('should return a copy of a boolean', (done) => {
            deepCompare(source,clone).should.equal(true);
            done();
         });

         it('should not retain a ref to the original boolean', (done) => {
            source = false;
            deepCompare(source,clone).should.equal(false);
            done();
         });
      });


      describe('- function cloning', () => {
         var source = (d) => { return(d*2);};
         var clone = deepClone(source);


         it('should return a copy of a function', (done) => {
            deepCompare(source,clone).should.equal(true);
            done();
         });

         it('should not retain a ref to the original function', (done) => {
            source = (d) => { return(d*99);};
            deepCompare(source,clone).should.equal(false);
            done();
         });
      });

      describe('- array cloning', () => {
      });

      describe('- object cloning', () => {
      });

   });
});
