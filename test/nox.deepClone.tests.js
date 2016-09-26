"use strict";

var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('underscore');

var deepClone = require('../deepClone');

describe('nox.deepClone', () => {
   describe('- basic usage : ', () => {

      describe('- string cloning', () => {
         it('should return a copy of a string', (done) => {
            var string = "a string;";
            var clone = deepClone(string);
            clone.should.equal(string);
            done();
         });

         it('should return not retain a ref to the original string', (done) => {
            var string = "a string;";
            var clone = deepClone(string);
            string = "xxx";
            clone.should.not.equal(string);
            done();
         });
      });

      describe('- number cloning', () => {
         it('should return a copy of a number', (done) => {
            var n = 10.3;
            var clone = deepClone(n);
            clone.should.equal(n);
            done();
         });

         it('should return not retain a ref to the original number', (done) => {
            var n = -19;
            var clone = deepClone(n);
            n = 0.99;
            clone.should.not.equal(n);
            done();
         });
      });

      describe('- boolean cloning', () => {
         it('should return a copy of a boolean', (done) => {
            var b = true;
            var clone = deepClone(b);
            clone.should.equal(b);
            done();
         });

         it('should return not retain a ref to the original boolean', (done) => {
            var b = false;
            var clone = deepClone(b);
            b = true;
            clone.should.not.equal(b);
            done();
         });
      });


      describe('- function cloning', () => {
         it('should return a copy of a function', (done) => {
            var f = (d) => { return(d*2);};
            var clone = deepClone(f);
            clone(24).should.equal(f(24));
            done();
         });

         it('should return not retain a ref to the original function', (done) => {
            var f = (d) => { return(d*2);};
            var clone = deepClone(f);
            f = (d) => { return(d*99);};
            clone(24).should.not.equal(f(24));
            done();
         });
      });

      describe('- array cloning', () => {
         it('should return a copy of the array', (done) => {
            var array = [true,"Hallo",10.4];
            var clone = deepClone(array);
            clone.length.should.equal(array.length);
            _.each(_.range(clone.length),(i) => {
               clone[i].should.equal(array[i]);
            });
            done();
         });

         it('should return not retain a ref to the original array', (done) => {
            var array = [true,"Hallo",10.4];
            var clone = deepClone(array);
            array = [false,"bye",-10.49,5];
            clone.length.should.not.equal(array.length);
            _.each(_.range(clone.length),(i) => {
               clone[i].should.not.equal(array[i]);
            });
            done();
         });
      });




   });
});
