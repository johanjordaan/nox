"use strict";

var _ = require('underscore');

// mods - "_remove" will renove the key to which it has been assigned
var deepClone = (source, mods) => {
   if(   _.isFunction(source)
      || _.isNumber(source)
      || _.isString(source)
      || _.isBoolean(source)
   ) {
		if(mods === undefined) {
      	return source;
		} else {
			return deepClone(mods);
		}
   }

   if(_.isArray(source)) {
      var retVal = [];
      _.each(source, (item) => {
			// Because its not named ignore mods
			// TODO : Maybee have positional mods?
         retVal.push(deepClone(item));
      });
      return retVal;
   }

   if(_.isObject(source)) {
      var retVal = {};
		// Process existing keys
		//
      _.each(_.keys(source), (key) => {
         if ( mods !== undefined && mods[key] === "_remove" ) {
            // Do not copy anything
         } else {
            retVal[key] = deepClone(source[key],mods !== undefined ? mods[key]: undefined);
         }
      });
		// Add extra keys
		//
		_.each(_.keys(mods), (key) => {
			if (mods[key] === "_remove" ) {
            // Skip these. They have already been processed above
         } else {
            retVal[key] = deepClone(mods[key]);
         }
		});

      return retVal;
	}
};


module.exports = deepClone;
