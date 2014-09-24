function Scope() {
  this.$$watchers = [];
  this.$$dirtyWatchfn;
}

Scope.prototype.$watch = function(watchFn, listenerFn, deep) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn,
    valueEq: !!deep
  };
  this.$$watchers.push(watcher);
};

Scope.prototype.$digest = function() {
  var dirty = false;
  var TTL = 10;
  var counter = 0;
  this.$$dirtyWatchfn = null;
  do {
    dirty = this.$digestOnce();
    if (counter++ > TTL) {
      throw '10 digest iterations reached';
    }
  } while (dirty);
};
Scope.prototype.$digestOnce = function() {
  var self = this;
  var dirty = false;

  _.forEach(this.$$watchers, function(watcher) {
    if (watcher.watchFn === self.$$dirtyWatchfn) {
      return false;
    } else {
      var newValue = watcher.watchFn.apply(self);
      var oldValue = watcher.last;
      if (!self.$equal(newValue, oldValue, watcher.valueEq)) {
        watcher.listenerFn.call(self, newValue, oldValue);
        watcher.last =  (watcher.valueEq ? _.cloneDeep(newValue) : newValue);
        dirty = true;
        self.$$dirtyWatchfn = watcher.watchFn;
      }
    }
  });
  return dirty;
};
Scope.prototype.$equal = function (newValue, oldValue, valueEq) {
  if (valueEq) {
    return _.isEqual(newValue, oldValue);
  }
  //deal with NaN
  return newValue === oldValue || 
    (typeof newValue === 'number' && typeof oldValue === 'number' &&
        isNaN(newValue) && isNaN(oldValue));
};
Scope.prototype.$apply = function(fn) {
  fn();
  this.$digest();
};
var scope = new Scope();
scope.a = [1, 2, 3];
scope.$watch(function () {
  return this.a;
}, function () {
  console.log('listen')
}, true);

scope.$digest();

// 自动开启一个digest
scope.$apply(function () {
  scope.a[0] = 4;
  //below nicer one
  // try {
  //   return this.$eval(expr);
  // } finally {
  //   this.$digest();
  // }
});

var ChildScope = function() { };
ChildScope.prototype = scope;
var child = new ChildScope();

child.$watch(function () {
  return this.a;
}, function (newValue) {
  console.log('listen child', newValue)
}, true);
child.$digest();
child.a.push(1);
child.$digest();
console.log(scope.a)