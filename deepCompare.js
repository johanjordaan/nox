"use strict";

var _ = require('underscore');


var check = (f,s,t,r) => {
   if(f(s)) {
      if(f(t)){
         return r(s,t);
      } else {
         return false;
      }
   } else {
      // Essentially skip the test since it does not pass f
      return true;
   }

};

var deepCompare = (source, target) => {
   return _deepCompare(source,target,true);
};

var _deepCompare = (source, target, eq) => {
   eq = eq && check(_.isFunction,source,target,(s,t)=>{return s===t;});
   eq = eq && check(_.isNumber,source,target,(s,t)=>{return s===t;});
   eq = eq && check(_.isString,source,target,(s,t)=>{return s===t;});
   eq = eq && check(_.isBoolean,source,target,(s,t)=>{return s===t;});

   eq = eq && check(_.isArray,source,target,(s,t)=>{
      if(s.length !== t.length) return false;

      return _.every(
         _.map(_.range(s.lenth),(i)=>{
            return _deepCompare(source[i],target[i],true);
         })
      );
   });


   eq = eq && check(_.isObject,source,target,(s,t)=>{
      if(_.keys(s).length !== _.keys(t).length) return false;

      return _.every(
         _.map(_.keys(s),(key)=>{
            return _deepCompare(source[key],target[key],true);
         })
      );
   });

   return eq;
};


module.exports = deepCompare;
