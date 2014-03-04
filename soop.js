var path = require('path');
var callsite = require('callsite');

// Decorate the given constructor with some useful
// object oriented constructs (mainly a convenient inherit()
// method and the ability to do a super send)
module.exports = function(constructor) {
  // inherit from the given constructor
  constructor.inherit = function(parent) {
    if(arguments.length > 1) {
      // this allows chaining multiple classes in the call
      parent.inherit(Array.prototype.slice.call(arguments, 1));
    }
    this.super_ = parent;
    this.prototype.__proto__ = parent.prototype;
    this.__proto__ = parent;
  };

  // invoke the given method of the parent
  constructor.super = function(receiver, method, args) {
    if(!this.super_) return;
    if(typeof method == 'string') {
      // invoke the named method
      return this.super_.prototype[method].apply(receiver, args);
    } else {
      // invoke the constructor of the parent
      return this.super_.apply(receiver, method);
    }
  };

  // set the parent if one is specified
  if(constructor.parent) {
    constructor.inherit(constructor.parent);
  }

  return constructor;
};

// load the given module using the given imports
module.exports.load = function(fname, imports) {
  var callerFilename = callsite()[1].getFileName();
  fname = path.resolve(path.dirname(callerFilename), fname);
  fname = require.resolve(fname);
  var cachedModule = require.cache[fname];
  if(cachedModule) delete require.cache[fname];
  global._imports = imports;
  var answer = require(fname);
  delete require.cache[fname];
  if(cachedModule) require.cache[fname] = cachedModule;
  return answer;
};

// access the imports passed from a call to load()
module.exports.imports = function() {
  var answer = global._imports || {};
  global._imports = {};
  return answer;
};
