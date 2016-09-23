"use strict";

var should = require('chai').should();
var expect = require('chai').expect;
var _ = require('underscore');

var test_utils = require("./test_utils");
var nox = require('../');

describe('nox.create_template', () => {
   describe('- basic usage : ', () => {
      var testTemplate = nox.createTemplate('testTemplate', {
         someField : nox.const({
            value : 'someValue'
         }),
      });

      it('should set the _noxTemplate flag', (done) => {
         testTemplate._noxTemplate.should.equal(true);
         done();
      });

      it('should set the _noxTemplateName to the name of the template', (done) => {
         testTemplate._noxTemplateName.should.equal('testTemplate');
         done();
      });

      it('should add the template to the list of templates', (done) => {
         (_.contains(_.keys(nox.templates),'testTemplate')).should.equal(true);
         done();
      });
   });
});

/*describe('nox.is_template_validate', () => {
#  describe('- basic usage : ', () => {
#    x_template = nox.create_template 'x_template',
#      name : nox.const
#        value : nox.const
#          xxx : "What is this"
#      surname : nox.rnd
#        no_max : 10
#
#    it('should detect errors on any level of the template', () => {
#      nox.is_template_valid(x_template).should.equal false
#
    #it('should detect a valid template', () => {
    #  valid_template  = nox.create_template 'valid',
    #    name : ("Hallo");
    #
    #  nox.is_template_valid(valid_template).should.equal true
*/
describe('nox.construct_template', () => {
   describe('- basic usage : ', () => {

      var parentTemplate = nox.createTemplate('parent_template', {
         parentVal: nox.const({
            value: 'parentValue',
         }),
      });
      var parentInstance = nox.constructTemplate(parentTemplate);

      it('should set _parent to unefined since this has no parent', (done) => {
         expect(parentInstance._parent).to.not.exist;
         done();
      });


      it('should set _index to unefined since this has no parent', (done) => {
         expect(parentInstance._index).to.not.exist;
         done();
      });


      it('should set the value of parentVal to parentValue', (done) => {
         parentInstance.parentVal.should.equal('parentValue');
         done();
      });

      var testTemplate = nox.createTemplate('testTemplate', {
         someField: nox.const({
            value: 'some_value',
         }),
         nonNoxValue: 'Hallo'
      });
      var testInstance = nox.constructTemplate(testTemplate, parentInstance, 3);

      it('should set _parent to the provided parent (parentInstance)', (done) => {
         testInstance._parent.should.equal(parentInstance);
         done();
      });

      it('should set _index to the provided index (3)', (done) => {
         testInstance._index.should.equal(3);
         done();
      });


      it('should set the _noxTemplate_name of the instance to the name of the template used to create it', (done) => {
         testInstance._noxTemplateName.should.equal('testTemplate');
         done();
      });

      it('should copy any non nox values directly to the result', (done) => {
         testInstance.nonNoxValue.should.equal("Hallo");
         done();
      });
   });

   describe('- string based construction usage : ', () => {
      var parentTemplate = nox.createTemplate('parentTemplate', {
         parentVal: nox.const({
            value: 'parentValue',
         })
      });
      var parentInstance = nox.constructTemplate('parentTemplate');

      it('should set _parent to unefined since this has no parent', (done) => {
         expect(parentInstance._parent).to.not.exist;
         done();
      });

      it('should set _index to unefined since this has no parent', (done) => {
         expect(parentInstance._index).to.not.exist;
         done();
      });

      it('should set the value of parentVal to parent_value', (done) => {
         parentInstance.parentVal.should.equal('parentValue');
         done();
      });
   });

   describe('- error conditions : ', () => {
      var xxx = {};
      var parentInstance = nox.constructTemplate(xxx.a);

      it('should return an error list if template passed to the constructor does not exist', (done) => {
         parentInstance._noxErrors.should.be.a('Array');
         parentInstance._noxErrors.length.should.equal(1);
         done();
      });

      it('should return a usable error message', (done) => {
         parentInstance._noxErrors[0].should.equal("Cannot construct template with undefined template parameter.");
         done();
      });

      var stringInstance = nox.constructTemplate('someSillyTemplate');

      it('should tell the user which template it could not find', (done) => {
         stringInstance._noxErrors[0].should.equal("Cannot find template [someSillyTemplate].");
         done();
      });
   });
});


describe('nox.extend_template', () => {
   describe('- basic usage (using the actual template class as input) : ', () => {
      var baseTemplate = nox.createTemplate('baseTemplate', {
         name: nox.const({
            value: 'nameField'
         }),
         type: nox.const({
            value: 'typeField'
         }),
         age: nox.const({
            value: 100
         }),
         city: "Joburg",
         someField: "someField",
         another: nox.rnd({
            max: 10
         }),
      });

      var childTemplate = nox.extendTemplate(baseTemplate, 'childTemplate', {
         type: {
            value: 'childType'                    // Overriding existing field's parameters
         },
         child_field: nox.const({                   // Adding new field
            value: 'child specific field'
         }),
         age: nox.rnd({                             // Override the function
            max: 80,
         }),
         city: "Pretoria",
         someField: nox.const({
            value: "notSomeValue",
         }),
         another: "not 10"
      });

      it('should set the name of the extended template to the name specified', (done) => {
         childTemplate._noxTemplateName.should.equal('childTemplate');
         done();
      });

      it('should add the base class fields to the extended template', (done) => {
         expect(childTemplate.name).to.exist;
         childTemplate.name.value.should.equal('nameField');
         done();
      });

      it('should override existing fields parameters ', (done) => {
         expect(childTemplate.type).to.exist;
         childTemplate.type.value.should.equal('childType');
         done();
      });

      it('should add any new fields from the child template ', (done) => {
         expect(childTemplate.child_field).to.exist;
         childTemplate.child_field.value.should.equal('child specific field');
         done();
      });

      it('should allow overiding of the function', (done) => {
         expect(childTemplate.age).to.exist;
         childTemplate.age.max.should.equal(80);
         done();
      });

      it('should allow overriding of direct fields with direct fields', (done) => {
         childTemplate.city.should.equal("Pretoria");
         done();
      });

      it('should allow overriding of direct fields with nox_methods', (done) => {
         childTemplate.someField.value.should.equal("notSomeValue");
         done();
      });

      it('should allow the overriding of a nox_method by a direct value', (done) => {
         childTemplate.another.should.equal("not 10");
         done();
      });


      test_utils.fixRandomValue(1);
      var child = nox.constructTemplate(childTemplate);

      it('should return the values from the child template and ones derived from base', (done) => {
         child.type.should.equal('childType');
         child.childField.should.equal('child specific field');
         child.age.should.equal(80);
         done();
      });
   });

   describe('- complex usage : testing multiple levels : ', () => {
      var starTemplate = nox.createTemplate('starTemplate', {
         planets: nox.select({
            count: nox.rnd({
               max : 10,
            }),
         }),
         values: ['a']
      });

      var mTemplate = nox.extendTemplate(starTemplate, 'mTemplate', {
         planets: {
            count: {
               min: 1,
               max: 2,
            }
         },
         values: ['x'],
      });

      it('should assign the overrideen values at the correct level of the child template', (done) => {
         expect(mTemplate.planets.count.min).to.exist;
         mTemplate.planets.count.min.should.equal(1);
         mTemplate.planets.count.max.should.equal(2);
         done();
      });
   });

   describe('extending an using directives', () => {
      var base = nox.createTemplate('base', {
         name: "name",
         surname : "surname",
      });

      var child = nox.extendTemplate(base,'child', {
         name: "child_name",
      },{
         remove : ['surname']
      });

      it('should leave the base template unmodified', (done) => {
         base.name.should.equal("name");
         expect(base.surname).to.exist;
         done();
      });
   });
});
