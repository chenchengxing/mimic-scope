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
  var self = this;
  _.forEach(this.$$watchers, function (watcher) {
    watcher.listenerFn.call(self);
  });
};

function noop () {}
var oneScope = new Scope();
oneScope.$watch(noop, function () {
  console.log('listener 1');
});

oneScope.$watch(noop, function () {
  console.log('listener 2');
});

oneScope.$digest();
oneScope.$digest();