"use strict";

var _ = require('underscore');

var lcg_rnd = require('lcg-rnd');
var deepClone = require('./deepClone');


var nox = {};



nox.isMethod = (object) => {
   if(object === undefined) return false;
   if(!_.isObject(object)) return false;
   return object._noxMethod == true;
};

nox.isTemplate = (object) => {
   if(object === undefined) return false;
   if(!_.isObject(object)) return false;
   return(object._noxTemplate !== undefined);
};

nox.isTemplateValid = (template) => {
   if(!nox.isTemplate(template)) return false;

   // TODO : Can this be done better? Seems like overkill to create an instance
   //
   var instance = nox.constructTemplate(template);

   return instance._noxErrors.length == 0;
};

nox.templates = {};

// Note this will owerwrite any other template by this name
nox.createTemplate = (name, properties) => {
   nox.templates[name] = properties;
   properties._noxTemplate = true;
   properties._noxTemplateName = name;
   return properties;
};

nox.constructTemplate = (template, parent, index) => {
   var retVal = {
      _parent: parent,
      _index: index,
      _noxErrors: [],
   };

   if(template === undefined) {
      retVal._noxErrors.push("Cannot construct template with undefined template parameter.");
      return retVal;
   }

   if(_.isString(template)) {
      var templateStr = template;
      var template = nox.templates[template];
      if(template === undefined) {
         retVal._noxErrors.push("Cannot find template [" + templateStr + "].");
         return retVal;
      }
   }

   var resolve = (source,obj) => {
      if(_.isObject(source) && !nox.isMethod(source)) {
         _.each(_.keys(source), (key) => {
            obj[key] = nox.resolve(source[key],retVal);
            resolve(source[key],obj[key]);
         });
      }
   };
   resolve(template,retVal);

  return retVal;
};

nox.extendTemplate = (sourceTemplate,name,properties) => {
   var newTemplate = deepClone(sourceTemplate,properties);
   return nox.createTemplate(name,newTemplate);
};

nox._noxKeys = ['_parent','_noxErrors','_index','_noxTemplateName','_noxTemplate'];
nox.deNox = (object) => {
   if(_.isArray(object)) {
      _.each(object,(item)=>{
         nox.deNox(item);
      });
   } else {
      if(_.isObject(object)) {
         _.each(nox._noxKeys,(noxKey) =>{
            delete object[noxKey];
         });
      }
      _.each(_.keys(object),(key)=>{
         nox.deNox(object[key]);
      });
   }
};

nox.resolve = (parameter,targetObject) => {
   if(nox.isMethod(parameter)) {
      return parameter.run(targetObject);
   } else {
      return parameter;
   }
};

nox.checkFields = (source, fieldList, targetObject) => {
   _.each(fieldList, (field) => {
      if(source[field] === undefined) {
         var error = `Required field [${field}] is missing.`;
         source._noxErrors.push(error);
         if(targetObject !== undefined) {
            targetObject._noxErrors.push(error);
         }
      }
   });

   return source._noxErrors.length > 0;
};

nox.method = (input) => {
   var retVal = new function() {
      this._noxMethod = true;
      this._noxErrors = [];
      this.method = input.method;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['method'],targetObject))
            return this._noxErrors;

         var method = nox.resolve(this.method,targetObject);
         return method(targetObject);
      };
   };

   return retVal;
};

nox.const = (input) => {
   var retVal = new function() {
      this._noxMethod = true;
      this._noxErrors = [];
      this.value = input.value;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['value'],targetObject))
            return this._noxErrors;

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
      this._noxMethod = true;
      this._noxErrors = [];
      this.min = input.min;
      this.max = input.max;
      this.normal = input.normal;
      this.integer = input.integer;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['min','max','normal','integer'],targetObject))
            return this._noxErrors;

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
      this._noxMethod = true;
      this._noxErrors = [];
      this.count = input.count;
      this.values = input.values;
      this.returnOne = input.returnOne;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['values'],targetObject))
            return this._noxErrors;

         var count = nox.resolve(this.count, targetObject);
         var returnOne = nox.resolve(this.return_one, targetObject);
         var values = nox.resolve(this.values, targetObject);

         if(count === 0 && !returnOne)
           return [];

         if(count !=1 && returnOne) {
            this._noxErrors.push("To select one a count of exactly 1 is required.");
            return this._noxErrors;
         }

         if(_.size(values) == 0) {
            this._noxErrors.push("Values list should contain at least one value.");
            return this._noxErrors;
         }

         var defaultProbability = 1/_.size(values);

         var retArr = [];
         _.each(_.range(0,count), (i) => {
            var r = lcg_rnd.random();
            var totalProbability = 0;
            var found = false;

            _.each(values, (item) => {
               if(found) return;

               var probability = defaultProbability;
               if(item.probability) probability = item.probability;
               totalProbability += probability;

               if(r<=totalProbability) {
                  found = true;
                  if(item.item && item.probability) {
                     if(nox.isTemplate(item.item)) {
                        retArr.push(nox.constructTemplate(item.item,targetObject,i));
                        found = true;
                     } else {
                        if(_.isString(item.item) && _.contains(_.keys(nox.templates),item.item)) {
                           retArr.push(nox.constructTemplate(nox.templates[item.item],targetObject,i));
                        } else {
                           retArr.push(item.item);
                        }
                     }
                  } else {
                     if(nox.isTemplate(item)) {
                        retArr.push(nox.constructTemplate(item,targetObject,i));
                     } else {
                        if(_.isString(item) && _.contains(_.keys(nox.templates),item)) {
                           retArr.push(nox.constructTemplate(nox.templates[item],targetObject,i));
                        } else {
                           retArr.push(item);
                        }
                     }
                  }
               }
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
