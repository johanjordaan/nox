/* eslint no-console: 0 */
"use strict";

var _ = require('underscore');

// mods - "_remove" will renove the key to which it has been assigned
var deepClone = (source, mods) => {
   return _deepClone(source, mods, {processed:[],cache:[]});
};

var _deepClone = (source, mods, refs) => {
   if(   _.isFunction(source)
      || _.isNumber(source)
      || _.isString(source)
      || _.isBoolean(source)
   ) {
		if(mods === undefined) {
      	return source;
		} else {
			return _deepClone(mods,undefined,refs);
		}
   }

   if(_.isArray(source)) {
      var retVal = [];
      _.each(source, (item) => {
			// Because its not named ignore mods
			// TODO : Maybee have positional mods?
         retVal.push(_deepClone(item,undefined,refs));
      });
      return retVal;
   }

   if(_.isObject(source)) {
      var index = _.indexOf(refs.processed,source);
      if(index !== -1) {
         return refs.cache[index];
      }
      var retVal = {};

      refs.processed.push(source);
      refs.cache.push(retVal);

      // Process existing keys
		//
      _.each(_.keys(source), (key) => {
         if ( mods !== undefined && mods[key] === "_remove" ) {
            // Do not copy anything
         } else {
            retVal[key] = _deepClone(source[key],mods !== undefined ? mods[key]: undefined, refs);
         }
      });
		// Add extra keys
		//
		_.each(_.keys(mods), (key) => {
			if (mods[key] === "_remove" ) {
            // Skip these. They have already been processed above
         } else {
            retVal[key] = _deepClone(mods[key], undefined, refs);
         }
		});

      return retVal;
	}
};


module.exports = deepClone;
