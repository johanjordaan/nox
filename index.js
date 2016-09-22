"use strict";

var _ = require('underscore');

var nox = {};

nox.isTemplate = (object) => {
   if(!object) return false;
   if(!_.isObject(object)) return false;
   return object._noxTemplate;
};

nox.isMethod = (object) => {
   if(!object) return false;
   if(!_.isObject(object)) return false;
   return object._noxMethod == true;
};

nox.deepClone = (source, directives) => {
   if(_.isFunction(source) || _.isNumber(source) || _.isString(source) || _.isBoolean(source))
      return source;

   if(_.isArray(source)) {
      var retVal = [];
      _.each(source, (item) => {
         retVal.push(nox.deepClone(item));
      });
      return retVal;
   }

   if(_.isObject(source))
      var retVal = {};
      _.each(_.keys(source), (key) => {
         if (directives && directives.remove && key in directives.remove) {
         } else {
           retVal[key] = nox.deepClone(source[key],directives);
         }
      });
      return retVal;
};

nox.probability = (probability,item) => {
   var retVal = {
      probability: probability,
      item: item,
   };
  return retVal;
};

nox.isMethodValid = (method) => {
   if(method._noxErrors.length > 0) return false;

   _.each(_.keys(method),(key) => {
      if(nox.isMethod(method[key]))
        if(!nox.isMethodValid(method[key]))
          return false;
   });
   return true;
};

nox.isTemplateValid = (template) => {
   if(!template) return false;
   if(!_.isObject(template)) return false;

   if(!nox.isTemplate(template)) return false;

   _.each(_.keys(template),(key)=>{
      if(nox.isMethod(template[key]))
         if(!nox.isMethodValid(template[key]))
            return false;
   });
   return true;
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
   var ret_val = {
      _parent: parent,
      _index: index,
      _noxErrors: [],
   };

   if(!template) {
      retVal._noxErrors.push("Cannot construct template with undefined template parameter.");
      return retVal;
   }

   if(_.isString(template)) {
      var templateStr = template;
      var template = nox.templates[template];
      if(!template) {
         retVal._noxErrors.push("Cannot find template [" + templateStr + "].");
         return ret_val;
      }
   }

   _.each(_.keys(template), (key) => {
      // Skip internal fields
      //
      if(key in ['_noxTemplate']){
      } else {
         if(nox.isMethod(template[key]))
            retVal[key] = template[key].run(retVal);
         else
           retVal[key] = nox.deepClone(template[key]);
      }

   });

  return retVal;
};

nox.extendFields = (fields, properties, directives) => {
   _.each(_.keys(properties), (key) => {
      // If the key does not exist in the source or (allows for new keys to be aded)
      // the properties value is not an object (allows methods to be overwritten by direct assignemnts)
      // the ret_val is not an object (allows overriding of direct value assignements)
      //   then simply deep_clone key from the parameters
      //
      //
      if(directives && directives.remove && key in directives.remove)
        delete(fields[key]);
      else {
         if(!fields[key] || !_.isObject(properties[key]) || !_.isObject(fields[key]) || nox.isMethod(properties[key]))
            fields[key] = nox.deepClone(properties[key]);
         else
            nox.extendFields(fields[key],properties[key]);
      }
   });
};

nox.extendTemplate = (sourceTemplate,name,properties,directives) => {
   //First copy the source_teplate as is
   //
   var retVal = nox.deepClone(sourceTemplate,directives);
   nox.extendFields(retVal,properties,directives);

   return nox.createTemplate(name,retVal);
};

nox.deNox = (object) => {
   if(_.isArray(o)) {
      _.each(object,(item)=>{
         nox.deNox(item);
      });
   } else {

      if(_.isObject(object)) {
         delete object._parent;
         delete object._nox_errors;
         delete object._index;
         delete object._nox_template_name;
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

nox.checkField = (field, field_name, errors) => {
   if(field === undefined)
      errors.push(`Required field [${field_name}] is missing.`);
};

nox.checkFields = (source, field_list) => {
   _.each(field_list, (field) => {
      nox.checkField(source[field],field,source._noxErrors);
   });

  return source._noxErrors.length > 0;
};

nox.const = (input) => {
   var retVal = new function() {
      this._noxMethod = true;
      this._noxErrors = [];
      this.value = input.value;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['value']))
           return this._noxErrors;

         var value = nox.resolve(this.value,targetObject);
         return value;
      };
   };
  return retVal;
};

nox.method = (input) => {
   var retVal = new function() {
      this._noxMethod = true;
      this._noxErrors = [];
      this.method = input.method;
      this.run = (targetObject) => {
         if(nox.checkFields(this,['method']))
            return this._noxErrors;

         var method = nox.resolve(this.method,targetObject);
         return method(targetObject);
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
         if(nox.checkFields(this,['min','max','normal','integer']))
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
               value += _.random(min,max);
            else
              value += min + diff*Math.random();
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

/*
nox.select = (input) => {
  if(!input.count) input.count = 1;
  if(!input.return_one) input.returnOne = false

  var retVal = {
     _noxMethod: true,
     _noxErrors: [],
     count : input.count,
     values : input.values,
     returnOne : input.returnOne,
     run: (targetObject) => {
         if(nox.checkFields(this,['values'])) return this._noxErrors

         var count = nox.resolve(this.count, target_object);
         var returnOne = nox.resolve(this.return_one, targetObject);
         var values = nox.resolve(this.values, targetObject);

         if(count === 0 && !returnOne)
           return [];

         if(count !=1 && returnOne) {
            this._noxErrors.push("To select one a count of exactly 1 is required.")
            return this._noxErrors;
         }

         if(_.size(values) == 0) {
            this._noxErrors.push("Values list should contain at least one value.")
            return this._noxErrors;
         }

         var defaultProbability = 1/_.size(values);

         var retArr = [];
         _.each(_.range(0,count), (i) => {
            var r = Math.random();
            var totalProbability = 0;

            _.each(values, (item) => {
               var probability = default_probability;
               if(item.probability) probability = item.probability;
               totalProbability += probability;

   /*            if(r<=total_probability)
                  if(item.item && item.probability)
                     if(nox.isTemplate(item.item))
                        ret_arr.push nox.construct_template item.item,target_object,i
                        break
                  else
                     if _.isString(item.item) && _.contains(_.keys(nox.templates),item.item)
                        ret_arr.push nox.construct_template nox.templates[item.item],target_object,i
                        break
                     else
                        ret_arr.push item.item
                        break
                  else
                     if nox.is_template item
                        ret_arr.push nox.construct_template item,target_object,i
                        break
                     else if _.isString(item) && _.contains(_.keys(nox.templates),item)
                        ret_arr.push nox.construct_template nox.templates[item],target_object,i
                        break
                     else
                        ret_arr.push item
                        break
            });
         });

      if(returnOne)
        return ret_val[0]
      else
        return ret_val
   }
   //return ret_val;
}
*/

nox.select = (input) => {

};

nox.select.one = (input) => {
   input.count = 1;
   input.returnOne = true;
   return nox.select(input);
};

module.exports = nox;
