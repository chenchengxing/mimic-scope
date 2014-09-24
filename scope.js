function Scope () {
  this.$$watchers = [];
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
  do {
    dirty = this.$digestOnce();
  } while(dirty);
};
Scope.prototype.$digestOnce = function () {
  var self = this;
  var dirty = false;
  _.forEach(this.$$watchers, function (watcher) {
    var newValue = watcher.watchFn.apply(self);
    var oldValue = watcher.last;
    if (newValue !== oldValue) {
      watcher.listenerFn.call(self, newValue, oldValue);
      watcher.last = newValue;
      dirty = true;
    }
  });
  return dirty;
}
function noop () {}
var oneScope = new Scope();
oneScope.$watch(function () {
  return this.kaka
}, function () {
  console.log('kaka change');
});
oneScope.$watch(function () {
  return this.name;
}, function (n, o) {
  console.log('listener 1', n, o);
  this.kaka = 'kaka';
});


// oneScope.$digest();
oneScope.name = '222';
oneScope.$digest();