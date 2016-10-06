"use strict";

var _ = require('underscore');
var object_hash = require('object-hash');

var lcg_rnd = require('lcg-rnd');
var deepClone = require('./deepClone');

var nox = {};

nox.isMethod = (object) => {
   if(!_.isObject(object)) return false;
   if(!_.isObject(object._nox)) return false;
   return object._nox.method == true;
};

nox.isTemplate = (object) => {
   if(!_.isObject(object)) return false;
   if(!_.isObject(object._nox)) return false;
   return(object._nox.template !== undefined);
};

nox.isTemplateValid = (template) => {
   if(!nox.isTemplate(template)) return false;

   // TODO : Can this be done better? Seems like overkill to create an instance
   //
   var instance = nox.constructTemplate(template);

   return instance._nox.errors.length == 0;
};

nox.templates = {};

// Note this will overwrite any other template by this name
nox.createTemplate = (name, properties) => {
   nox.templates[name] = deepClone(properties);
   nox.templates[name]._nox = {
      template: true,
      name: name,
   };
   return nox.templates[name];
};

nox.resolve = (parameter,targetObject,index) => {
   if(nox.isTemplate(parameter)) {
      return nox.constructTemplate(parameter,targetObject,index);
   } else {
      if(_.isString(parameter) && _.contains(_.keys(nox.templates),parameter)) {
         return nox.constructTemplate(nox.templates[parameter],targetObject,index);
      } else if(nox.isMethod(parameter)) {
         return parameter.run(targetObject);
      } else {
         return parameter;
      }
   };
};

nox.constructTemplate = (template, parent, index, seed, hash) => {
   var retVal = {
      _nox: {
         parent: parent,
         index: index,
         errors: [],
         seed: undefined,
         hash: undefined
      }
   };

   if(template === undefined) {
      retVal._nox.errors.push("Cannot construct template with undefined template parameter.");
      return retVal;
   }

   if(_.isString(template)) {
      var templateStr = template;
      template = nox.templates[template];
      if(template === undefined) {
         retVal._nox.errors.push("Cannot find template [" + templateStr + "].");
         return retVal;
      }
   }

   retVal._nox.templateName = template._nox.name;

   if(seed === undefined || hash === undefined) {
      retVal._nox.seed = lcg_rnd.lcgParm.seed;
      retVal._nox.hash = object_hash(template);
   } else {
      if(object_hash(template) !== hash ) {
         retVal._nox.errors.push("Hash does not match template.",object_hash(template),hash);
         return retVal;
      } else {
         retVal._nox.hash = hash;
         retVal._nox.seed = seed;
         lcg_rnd.srand(seed);
      }
   }

   var resolve = (source,obj) => {
      if(_.isObject(source) && !nox.isMethod(source)) {
         _.each(_.keys(source), (key) => {
            if(key === "_nox") {
            } else {
               if(_.isArray(source[key])) {
                  obj[key] = [];
                  _.each(source[key],(item)=>{
                     obj[key].push(nox.resolve(item,retVal));
                  });
               } else {
                  obj[key] = nox.resolve(source[key],retVal);
                  resolve(source[key],obj[key]);
               }
            }
         });
      }
   };
   resolve(deepClone(template),retVal);

   return retVal;
};

nox.extendTemplate = (sourceTemplate,name,properties) => {
   var newTemplate = deepClone(sourceTemplate,properties);
   return nox.createTemplate(name,newTemplate);
};

// Walk a nox object. If the f return false then it will stop descending
// deafult to continue descending
nox._walk = (object, f) => {
   if(_.isArray(object)) {
      _.each(object,(item)=>{
         nox._walk(item,f);
      });
   } else {
      if(_.isObject(object)) {
         _.each(_.keys(object),(key) =>{
            if(f(key,object[key],object) !== false){
               nox._walk(object[key],f);
            }
         });
      }
   }
};

nox.deNox = (object) => {
   var retVal = deepClone(object);

   var _deNox = (key,item,object) => {
      if(key === "_nox"){
         delete object[key];
      } else {
      }
   };

   nox._walk(retVal,_deNox);
   return(retVal);
};

nox.serialise = (noxObject) => {
   var retVal = deepClone(noxObject);

   var _serialise = (key,item,object) => {
      if(key !== "_nox"){
         delete object[key];
         return(true);
      } else {
         nox._walk(item,(key,item,object) => {
            if(!_.contains(["seed","hash","templateName"],key)) {
               delete object[key];
            };
         });
         return(false);
      }
   };

   nox._walk(retVal,_serialise);

   return(retVal);
};

nox.deserialise = (serialisedObject) => {
   var retVal = nox.constructTemplate(
      serialisedObject._nox.templateName,
      undefined, //parent,
      undefined, //index,
      serialisedObject._nox.seed,
      serialisedObject._nox.hash
   );

   return retVal;
};

nox.checkFields = (source, fieldList, targetObject) => {
   _.each(fieldList, (field) => {
      if(source[field] === undefined) {
         var error = `Required field [${field}] is missing.`;
         source._nox.errors.push(error);
         if(targetObject !== undefined) {
            targetObject._nox.errors.push(error);
         }
      }
   });

   return source._nox.errors.length > 0;
};

//-----------------
nox.method = (input) => {
   var retVal = new function() {
      this._nox = {
         method: true,
         type: "method",
         errors: [],
      };
      this.method = input.method;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['method'],targetObject))
            return this._nox.errors;

         var method = nox.resolve(this.method,targetObject);
         return method(targetObject);
      };
   };

   return retVal;
};

nox.const = (input) => {
   var retVal = new function() {
      this._nox = {
         method: true,
         type: "const",
         errors: [],
      };
      this.value = input.value;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['value'],targetObject))
            return this._nox.errors;

         var value = nox.resolve(this.value,targetObject);
         return value;
      };
   };
   return retVal;
};

nox.rnd = (input) => {
   if(input.min === undefined) input.min = 0;
   if(input.normal === undefined) input.normal = false;
   if(input.integer === undefined) input.integer = false;

   var retVal = new function() {
      this._nox = {
         method: true,
         type: "rnd",
         errors: [],
      };
      this.min = input.min;
      this.max = input.max;
      this.normal = input.normal;
      this.integer = input.integer;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['min','max','normal','integer'],targetObject))
            return this._nox.errors;

         var min = nox.resolve(this.min, targetObject);
         var max = nox.resolve(this.max, targetObject);
         var normal = nox.resolve(this.normal, targetObject);
         var integer = nox.resolve(this.integer, targetObject);

         var itterations = 1;
         if(normal) itterations = 3;

         var value = 0;
         var diff = max - min;
         _.each(_.range(itterations), (i)=>{
            if(integer)
               value += lcg_rnd.rndIntBetween(min,max);
            else
              value += min + diff*lcg_rnd.random();
         });
         value = value/itterations;
         return value;
      };
   };
   return retVal;
};

nox.rnd.int = (input) => {
   input.integer = true;
   return nox.rnd(input);
};

nox.rnd.normal = (input) => {
   input.normal = true;
   return nox.rnd(input);
};

nox.select = (input) => {
   if(input.count === undefined) input.count = 1;
   if(input.returnOne === undefined) input.returnOne = false;

   var retVal = new function() {
      this._nox = {
         method: true,
         type: "select",
         errors: [],
      };
      this.count = input.count;
      this.values = input.values;
      this.returnOne = input.returnOne;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['values'],targetObject))
            return this._nox.errors;

         var count = nox.resolve(this.count, targetObject);
         var returnOne = nox.resolve(this.returnOne, targetObject);
         var values = nox.resolve(this.values, targetObject);

         if(_.size(values) == 0) {
            this._nox.errors.push("Values list should contain at least one value.");
            return this._nox.errors;
         }

         if(count !=1 && returnOne) {
            this._nox.errors.push("To select one a count of exactly 1 is required.");
            return this._nox.errors;
         }

         if(count === 0 && !returnOne)
           return [];

         // Convert values into prob structures if they are not already
         //
         if(values[0].probability === undefined) {
            var defaultProbability = 1/_.size(values);
            values = _.map(values,(item) => {
               return {
                  item: item,
                  probability: defaultProbability,
               };
            });
         };

         var retArr = [];
         _.each(_.range(0,count), (i) => {
            var r = lcg_rnd.random();
            var totalProbability = 0;
            var found = false;

            _.each(values, (item) => {
               if(found) return;

               totalProbability += item.probability;

               if(r<=totalProbability) {
                  found = true;
                  if(nox.isTemplate(item.item)) {
                     retArr.push(nox.constructTemplate(item.item,targetObject,i));
                  } else {
                     if(_.isString(item.item) && _.contains(_.keys(nox.templates),item.item)) {
                        retArr.push(nox.constructTemplate(nox.templates[item.item],targetObject,i));
                     } else {
                        retArr.push(nox.resolve(item.item));
                     }
                  }
               };
            });
         });

         if(this.returnOne)
           return retArr[0];
         else
           return retArr;
      };
   };

   return retVal;
};


nox.select.one = (input) => {
   input.count = 1;
   input.returnOne = true;
   return nox.select(input);
};

module.exports = nox;
