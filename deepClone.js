"use strict";

var _ = require('underscore');

var deepClone = (source, directives) => {
   if(   _.isFunction(source)
      || _.isNumber(source)
      || _.isString(source)
      || _.isBoolean(source)
   ) {
      return source;
   }

   if(_.isArray(source)) {
      var retVal = [];
      _.each(source, (item) => {
         retVal.push(deepClone(item));
      });
      return retVal;
   }

   if(_.isObject(source)) {
      var retVal = {};
      _.each(_.keys(source), (key) => {
         if (  directives !== undefined
               && directives.remove
               && _.contains(directives.remove,key)) {
            // Do not copy anything
         } else {
            retVal[key] = deepClone(source[key],directives);
         }
      });
      return retVal;
	}
};


module.exports = deepClone;
