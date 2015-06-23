// Generated by CoffeeScript 1.9.2
(function() {
  var Kefir, _activateHelper, logItem,
    slice = [].slice;

  Kefir = require("kefir");

  exports.Kefir = Kefir;

  logItem = function(event) {
    if (event.type === 'value') {
      if (event.current) {
        return {
          current: event.value
        };
      } else {
        return event.value;
      }
    } else if (event.type === 'error') {
      if (event.current) {
        return {
          currentError: event.value
        };
      } else {
        return {
          error: event.value
        };
      }
    } else {
      if (event.current) {
        return '<end:current>';
      } else {
        return '<end>';
      }
    }
  };

  exports.watch = function(obs) {
    var fn, log, unwatch;
    log = [];
    fn = function(event) {
      return log.push(logItem(event));
    };
    unwatch = function() {
      return obs.offAny(fn);
    };
    obs.onAny(fn);
    return {
      log: log,
      unwatch: unwatch
    };
  };

  exports.watchWithTime = function(obs) {
    var log, startTime;
    startTime = new Date();
    log = [];
    obs.onAny(function(event) {
      return log.push([new Date() - startTime, logItem(event)]);
    });
    return log;
  };

  exports.send = function(obs, events) {
    var event, i, len;
    for (i = 0, len = events.length; i < len; i++) {
      event = events[i];
      if (event === '<end>') {
        if (obs._send)
          obs._send('end');
        else
          obs._emitEnd();
      }
      if (typeof event === 'object' && 'error' in event) {
        if (obs._send)
          obs._send('error', event.error);
        else
          obs._emitError(event.error);
      } else {
        if (obs._send)
          obs._send('value', event);
        else
          obs._emitValue(event);
      }
    }
    return obs;
  };

  _activateHelper = function() {};

  exports.activate = function(obs) {
    obs.onEnd(_activateHelper);
    return obs;
  };

  exports.deactivate = function(obs) {
    obs.offEnd(_activateHelper);
    return obs;
  };

  exports.prop = function() {
    return new Kefir.Property();
  };

  exports.stream = function() {
    return new Kefir.Stream();
  };

  exports.inBrowser = (typeof window !== "undefined" && window !== null) && (typeof document !== "undefined" && document !== null);

  exports.withDOM = function(cb) {
    var div;
    div = document.createElement('div');
    document.body.appendChild(div);
    cb(div);
    return document.body.removeChild(div);
  };

  beforeEach(function() {
    return this.addMatchers({
      toBeProperty: function() {
        this.message = function() {
          return "Expected " + (this.actual.toString()) + " to be instance of Property";
        };
        return this.actual instanceof Kefir.Property;
      },
      toBeStream: function() {
        this.message = function() {
          return "Expected " + (this.actual.toString()) + " to be instance of Stream";
        };
        return this.actual instanceof Kefir.Stream;
      },
      toBeEmitter: function() {
        this.message = function() {
          return "Expected " + (this.actual.toString()) + " to be instance of Emitter";
        };
        return this.actual instanceof Kefir.Emitter;
      },
      toBePool: function() {
        this.message = function() {
          return "Expected " + (this.actual.toString()) + " to be instance of Pool";
        };
        return this.actual instanceof Kefir.Pool;
      },
      toBeActive: function() {
        return this.actual._active;
      },
      toEmit: function(expectedLog, cb) {
        var log, ref, unwatch;
        ref = exports.watch(this.actual), log = ref.log, unwatch = ref.unwatch;
        if (typeof cb === "function") {
          cb();
        }
        unwatch();
        this.message = function() {
          return "Expected to emit " + (jasmine.pp(expectedLog)) + ", actually emitted " + (jasmine.pp(log));
        };
        return this.env.equals_(expectedLog, log);
      },
      errorsToFlow: function(source) {
        var expectedLog, log, ref, unwatch;
        expectedLog = this.isNot ? [] : [
          {
            error: -2
          }, {
            error: -3
          }
        ];
        if (this.actual instanceof Kefir.Property) {
          exports.activate(this.actual);
          exports.send(source, [
            {
              error: -1
            }
          ]);
          exports.deactivate(this.actual);
          if (!this.isNot) {
            expectedLog.unshift({
              currentError: -1
            });
          }
        } else if (source instanceof Kefir.Property) {
          exports.send(source, [
            {
              error: -1
            }
          ]);
          if (!this.isNot) {
            expectedLog.unshift({
              currentError: -1
            });
          }
        }
        ref = exports.watch(this.actual), log = ref.log, unwatch = ref.unwatch;
        exports.send(source, [
          {
            error: -2
          }, {
            error: -3
          }
        ]);
        unwatch();
        if (this.isNot) {
          this.message = function() {
            return "Expected errors not to flow (i.e. to emit [], actually emitted " + (jasmine.pp(log)) + ")";
          };
          return !this.env.equals_(expectedLog, log);
        } else {
          this.message = function() {
            return "Expected errors to flow (i.e. to emit " + (jasmine.pp(expectedLog)) + ", actually emitted " + (jasmine.pp(log)) + ")";
          };
          return this.env.equals_(expectedLog, log);
        }
      },
      toEmitInTime: function(expectedLog, cb, timeLimit) {
        var log;
        if (timeLimit == null) {
          timeLimit = 10000;
        }
        log = null;
        exports.withFakeTime((function(_this) {
          return function(tick) {
            log = exports.watchWithTime(_this.actual);
            if (typeof cb === "function") {
              cb(tick);
            }
            return tick(timeLimit);
          };
        })(this));
        this.message = function() {
          return "Expected to emit " + (jasmine.pp(expectedLog)) + ", actually emitted " + (jasmine.pp(log));
        };
        return this.env.equals_(expectedLog, log);
      },
      toActivate: function() {
        var andOp, check, correctResults, name, notNotStr, notStr, obs, obss, orOp, tests;
        obss = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        orOp = function(a, b) {
          return a || b;
        };
        andOp = function(a, b) {
          return a && b;
        };
        notStr = (this.isNot ? 'not ' : '');
        notNotStr = (this.isNot ? '' : 'not ');
        tests = {};
        tests["some activated at start"] = true;
        tests["some " + notNotStr + "activated"] = true;
        tests["some " + notNotStr + "deactivated"] = true;
        tests["some " + notNotStr + "activated at second try"] = true;
        tests["some " + notNotStr + "deactivated at second try"] = true;
        correctResults = {};
        correctResults["some activated at start"] = true;
        correctResults["some " + notNotStr + "activated"] = true;
        correctResults["some " + notNotStr + "deactivated"] = true;
        correctResults["some " + notNotStr + "activated at second try"] = true;
        correctResults["some " + notNotStr + "deactivated at second try"] = true;
        if (this.isNot) {
          correctResults["some " + notNotStr + "activated"] = false;
          correctResults["some " + notNotStr + "activated at second try"] = false;
        }
        check = function(test, conditions) {
          var condition, i, j, len, len1;
          if (correctResults[test] === true) {
            for (i = 0, len = conditions.length; i < len; i++) {
              condition = conditions[i];
              if (!condition) {
                tests[test] = false;
                return;
              }
            }
          } else {
            for (j = 0, len1 = conditions.length; j < len1; j++) {
              condition = conditions[j];
              if (condition) {
                return;
              }
            }
            return tests[test] = false;
          }
        };
        check("some activated at start", (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = obss.length; i < len; i++) {
            obs = obss[i];
            results.push(!obs._active);
          }
          return results;
        })());
        exports.activate(this.actual);
        check("some " + notNotStr + "activated", (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = obss.length; i < len; i++) {
            obs = obss[i];
            results.push(obs._active);
          }
          return results;
        })());
        exports.deactivate(this.actual);
        check("some " + notNotStr + "deactivated", (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = obss.length; i < len; i++) {
            obs = obss[i];
            results.push(!obs._active);
          }
          return results;
        })());
        exports.activate(this.actual);
        check("some " + notNotStr + "activated at second try", (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = obss.length; i < len; i++) {
            obs = obss[i];
            results.push(obs._active);
          }
          return results;
        })());
        exports.deactivate(this.actual);
        check("some " + notNotStr + "deactivated at second try", (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = obss.length; i < len; i++) {
            obs = obss[i];
            results.push(!obs._active);
          }
          return results;
        })());
        this.message = function() {
          var failedTest, name, obssNames;
          failedTest = ((function() {
            var results;
            results = [];
            for (name in tests) {
              if (tests[name] !== correctResults[name]) {
                results.push(name);
              }
            }
            return results;
          })()).join(', ');
          obssNames = ((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = obss.length; i < len; i++) {
              obs = obss[i];
              results.push(obs.toString());
            }
            return results;
          })()).join(', ');
          return "Expected " + (this.actual.toString()) + " to " + notStr + "activate: " + obssNames + " (" + failedTest + ")";
        };
        for (name in tests) {
          if (tests[name] !== correctResults[name]) {
            return this.isNot;
          }
        }
        return !this.isNot;
      }
    });
  });

}).call(this);
