function Scope() {
  this.$$watchers = [];
  this.$$dirtyWatchfn;
}

Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn
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
      if (newValue !== oldValue) {
        watcher.listenerFn.call(self, newValue, oldValue);
        watcher.last = newValue;
        dirty = true;
        self.$$dirtyWatchfn = watcher.watchFn;
      }
    }
  });
  return dirty;
};

var scope = new Scope();

scope.array = _.range(2);
var watchExecutions = 0;
_.times(2, function(i) {
  scope.$watch(
    function() {
      watchExecutions++;
      return this.array[i];
    },
    function(newValue, oldValue, scope) {}
  );
});
scope.$digest();

console.log(watchExecutions);

scope.array[1] = 100;

scope.$digest();
console.log(watchExecutions);
