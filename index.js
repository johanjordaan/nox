"use strict"

var _ = require('underscore')

var nox = {}

nox.isTemplate = (object) => {
   if(!object) return false;
   if(!_.isObject(object)) return false;
   return object._noxTemplate;
}

nox.isMethod = (object) => {
   if(!object) return false;
   if(!_.isObject(object)) return false;
   return object._noxMethod == true;
}

nox.deepClone = (source, directives) => {
   if(_.isFunction(source) || _.isNumber(source) || _.isString(source) || _.isBoolean(source))
      return source;

   if(_.isArray(source)) {
      var retVal = [];
      _.each(source, (item) => {
         retVal.push(nox.deepClone(item));
      })
      return retVal;
   }

   if(_.isObject(source))
      var retVal = {};
      _.each(_.keys(source), (key) => {
         if (directives && directives.remove && key in directives.remove) {
         } else {
           retVal[key] = nox.deepClone(source[key],directives);
         }
      })
      return retVal;
}

nox.probability = (probability,item) => {
   var retVal = {
      probability: probability,
      item: item,
   }
  return retVal;
}

nox.isMethodValid = (method) => {
   if(method._noxErrors.length > 0) return false;

   _.each(_.keys(method),(key) => {
      if(nox.isMethod(method[key]))
        if(!nox.isMethodValid(method[key]))
          return false;
   });
   return true;
}

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
}

nox.templates = {}

// Note this will owerwrite any other template by this name
nox.createTemplate = (name, properties) => {
   nox.templates[name] = properties;
   properties._noxTemplate = true;
   properties._noxTemplateName = name;
   return properties;
}

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

   })

  return retVal;
}

nox.extendFields = (fields, properties, directives) => {
   _.each(_.keys(properties), (key) => {
      // If the key does not exist in the source or (allows for new keys to be aded)
      // the properties value is not an object (allows methods to be overwritten by direct assignemnts)
      // the ret_val is not an object (allows overriding of direct value assignements)
      //   then simply deep_clone key from the parameters
      //
      //
      if(directives && directives.remove && key in directives.remove)
        delete(fields[key])
      else {
         if(!fields[key] || !_.isObject(properties[key]) || !_.isObject(fields[key]) || nox.isMethod(properties[key]))
            fields[key] = nox.deepClone(properties[key])
         else
            nox.extendFields(fields[key],properties[key])
      }
   });
}

nox.extendTemplate = (sourceTemplate,name,properties,directives) => {
   //First copy the source_teplate as is
   //
   var retVal = nox.deepClone(sourceTemplate,directives);
   nox.extendFields(retVal,properties,directives);

   return nox.createTemplate(name,retVal)
}

nox.deNox = (object) => {
   if(_.isArray(o)) {
      _.each(object,(item)=>{
         nox.deNox(item);
      })
   } else {

      if(_.isObject(object)) {
         delete object._parent
         delete object._nox_errors
         delete object._index
         delete object._nox_template_name
      }

      _.each(_.keys(object),(key)=>{
         nox.deNox(object[key]);
      })
   }
}

nox.resolve = (parameter,targetObject) => {
   if(nox.isMethod(paremeter)) {
      return parameter.run(targetObject);
   } else {
      return parameter;
   }

}

nox.checkField = (field, field_name, errors) => {
   if(!field)
      errors.push('Required field [${field_name}] is missing.');
}

nox.checkFields = (source,field_list) => {
   _.each(field_list, (field) =>{
      nox.checkField(source[field],field,source._noxErrors);
   })

  return source._noxErrors.length > 0
}

nox.const = (input) => {
   var retVal = {
      _noxMethod : true,
      _noxErrors : [],
      value : input.value,
      run : (targetObject) => {
         if(nox.checkFields(this,['value']))
           return this._noxErrors;

         var value = nox.resolve(this.value,targetObject);
         return value;
      },
   }
  return retVal;
}

nox.method = (input) => {
   var retVal = {
      _noxMethod: true,
      _noxErrors: [],
      method : input.method,
      run : (targetObject) => {
         if(nox.checkFields(this,['method']))
            return this._noxErrors

         var method = nox.resolve(this.method,targetObject);
         return method(targetObject)
      }
   }

   return retVal;
}

nox.rnd = (input) => {
   if(!input.min) input.min = 0
   if(!input.normal) input.normal = false
   if(!input.integer) input.integer = false

   var retVal = {
      _noxMethod: true,
      _noxErrors: [],
      min: input.min,
      max: input.max,
      normal: input.normal,
      integer: input.integer,
      run : (targetObject) => {
         if(nox.check_fields(this,['min','max','normal','integer']))
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
         })
         value = value/itterations;
         return value;
      }
   }
   return retVal;
}


nox.rnd.int = (input) => {
   input.integer = true;
   return nox.rnd(input);
}

nox.rnd.normal = (input) => {
   input.normal = true;
   return nox.rnd(input);
}

nox.select = (input) => {
  if !input.count? then input.count = 1
  if !input.return_one? then input.return_one = false
  if !input.enable_batching? then input.enable_batching = false
  if !input.batch_size? then input.batch_size = 0
  if !input.batch_cb? then input.batch_cb = () ->

  ret_val =
    _nox_method : true
    _nox_errors : []
    count : input.count
    values : input.values
    return_one : input.return_one
    enable_batching : input.enable_batching
    batch_size : input.batch_size
    batch_cb : input.batch_cb
    run : (target_object) ->
      if nox.check_fields @,['values']
        return @_nox_errors

      count = nox.resolve @count, target_object
      values = nox.resolve @values, target_object
      return_one = nox.resolve @return_one, target_object
      enable_batching = nox.resolve @enable_batching, target_object
      batch_size = nox.resolve @batch_size, target_object
      batch_cb = nox.resolve @batch_cb, target_object

      # If the size of the list is 0 and we dont require only one then return an empty list
      #
      if count == 0 && !return_one
        return []

      if count !=1 && return_one
        @_nox_errors.push "To select one a count of exactly 1 is required."
        return @_nox_errors

      if _.size(values) == 0
        @_nox_errors.push "Values list should contain at least one value."
        return @_nox_errors

      default_probability = 1/_.size(values)


      # Handle the half batches at the end
      #
      extra_batch = 0
      if count%batch_size > 0
        extra_batch = 1
      # Calculate the number of batches required
      #
      num_batches = Math.floor(count/batch_size)+extra_batch
      batch_count = 0
      batch_busy = false

      ret_val = []
      generate = () ->
        batch_busy = true
        ret_arr = []

        start = 0
        stop  = count
        if enable_batching
          start = batch_count*batch_size
          stop = (batch_count+1)*batch_size
          last_batch = false
          if stop>count
            stop = count
            last_batch = true


        for i in _.range(start,stop)
          r = Math.random()
          total_probability = 0
          for item in values
            probability = if item.probability? then item.probability else default_probability
            total_probability += probability
            if r<=total_probability
              if item.item? && item.probability?
                if nox.is_template(item.item)
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

        if enable_batching
          batch_cb batch_size,batch_count,last_batch,ret_arr, () ->
            console.log 'Here....'
            batch_count += 1
            batch_busy = false

        return ret_arr

      ret_val = generate()

      if enable_batching
        f = () ->
          if batch_count <= num_batches
            if not batch_busy
              generate()
            else
              console.log 'Waiting...'
            setTimeout f,100

        setTimeout f,100





      if return_one
        return ret_val[0]
      else
        return ret_val
  return ret_val
}

nox.select.one = (input) => {
   input.count = 1;
   input.returnOne = true;
   return nox.select(input);
}

module.exports = nox
