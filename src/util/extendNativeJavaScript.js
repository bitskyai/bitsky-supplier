// Add a toJSON function to Error
if (!("serialize" in Error.prototype)){
  Object.defineProperty(Error.prototype, "serialize", {
    value: function() {
      var alt = {};
      Object.getOwnPropertyNames(this).forEach(function(key) {
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true
  });
}