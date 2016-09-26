"use strict";

var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('underscore');

var deepClone = require('../deepClone');

describe('nox.deepClone', () => {
   describe('- usage without extension or directives : ', () => {

      describe('- string cloning', () => {
         it('should return a copy of a string', (done) => {
            var string = "a string;";
            var clone = deepClone(string);
            clone.should.equal(string);
            done();
         });

         it('should not retain a ref to the original string', (done) => {
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

         it('should not retain a ref to the original number', (done) => {
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

         it('should not retain a ref to the original boolean', (done) => {
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

         it('should not retain a ref to the original function', (done) => {
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

         it('should not retain a ref to the original array', (done) => {
            var array = [true,"Hallo",10.4];
            var clone = deepClone(array);
            array.push("x");
            clone.length.should.not.equal(array.length);
            done();
         });
      });

      describe('- object cloning', () => {
         it('should return a copy of an object (no recursion)', (done) => {
            var o = { a:"Hallo",b:10.9,c:true};
            var clone = deepClone(o);
            _.keys(clone).length.should.equal(_.keys(o).length);
            _.each(_.keys(clone),(key) => {
               clone[key].should.equal(o[key]);
            });
            done();
         });

         it('should return a copy of an object (with recursion)', (done) => {
            var p = {
               name:"ben",
               children:[{name:"sue"},{name:"peter"}],
               wife:{name:"sally"},
            };
            var clone = deepClone(p);
            _.keys(clone).length.should.equal(_.keys(p).length);
            _.each(_.keys(clone),(key) => {
               if(_.isArray(clone[key])) {
                  _.each(_.range(clone[key].length),(i)=>{
                     clone[key][i].should.equal(p[key][i]);
                  });
               } else if(_.isObject(clone[key])) {
                  _.keys(clone[key]).length.should.equal(_.keys(p[key]).length);
                  _.each(_.keys(clone[key]),(innerKey) => {
                     clone[key][innerKey].should.equal(p[key][innerKey]);
                  });
               } else {
                  clone[key].should.equal(p[key]);   
               }
            });
            done();
         });

      });

   });
});
