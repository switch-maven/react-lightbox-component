'use strict';

var classNames = {
  getNames: function getNames(element) {
    return element.className.split(/\s+/);
  },
  contains: function contains(element, classNames) {
    classNames = [].concat(classNames);
    var classList = this.getNames(element);
    for (var i in classNames) {
      if (classList.indexOf(classNames[i]) > -1) {
        return true;
      }
    }
    return false;
  },
  add: function add(element, className) {
    if (!this.contains(element, className)) {
      element.className = [element.className, className].join(' ');
    }
  },
  remove: function remove(element, className) {
    var classList = this.getNames(element);
    element.className = classList.filter(function (name) {
      return name !== className;
    }).join(' ');
  },
  toggle: function toggle(element, className) {
    if (this.contains(element, className)) {
      this.remove(element, className);
    } else {
      this.add(element, className);
    }
  }
};

module.exports = classNames;