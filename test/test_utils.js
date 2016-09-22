var savedRandom = Math.random;

var fixRandomValue = (value) => {
   fixRandomValues([value]);
};

var fixRandomValues = (values) => {
   var values = values.reverse();
   Math.random = () => {
      var value = values.pop();
      fixRandomValues(values.reverse());
      if(values.length === 0) {
         Math.random = savedRandom;
      }
      return value;
   };
};

module.exports = {
	fixRandomValue: fixRandomValue,
	fixRandomValues: fixRandomValues,
};
