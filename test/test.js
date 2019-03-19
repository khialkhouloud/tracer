"use strict";
var test = require('tape');//var t = require("t");

test("simple", function(t) {
	var logger = require('../').console({
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	var o = logger.info('hello');
	t.equal(o['message'], 'hello');
	t.equal(o['file'], 'test.js');
	t.equal(o['line'], '11');
	t.equal(o['level'], 3);
	t.end();
})

test("stack index",  function(t) {
	var logger = require('../').console({
		stackIndex: 1,
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	var logMgr = function(type, msg) {
		return logger[type](msg);
	};
	var o = logMgr('info', 'hello');
	t.equal(o['message'], 'hello');
	t.equal(o['file'], 'test.js');
	t.equal(o['line'], '30');
	t.end();
})

test("simple message", function(t) {
	var logger = require('../').console({
		format : "{{message}}",
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	var o = logger.log('hello');
	t.equal(o['output'], 'hello');
	t.end();
})

test("inspect depth" ,function(t) {
	var logger = require('../').console({
		format : "{{message}}",
		transport : function(data) {
			console.log(data.output);
			return data;
		},
		inspectOpt : {
			showHidden : false,
			depth: 1
		}
	});
	var o = logger.log({
		i1 : 'value',
		i2 : {
			i21 : 'val21',
			i22 : {
				i31 : 'val31'
			}
		}
	});
	t.equal(o['output'], "{ i1: 'value', i2: { i21: 'val21', i22: [Object] } }");
	t.end();
})

test("simple color message", function(t) {
	var logger = require('../').colorConsole({
		format : "{{message}}",
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	var o = logger.debug('hello');
	t.equal(o.output, '\u001b[36mhello\u001b[39m');
	t.end();
})

test("console log method", function(t) {
	var logger = require('../').console({
		format : "{{message}}",
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	var o = logger.log('hello %s %d %j %t', 'world', 123, {j:'val'}, {t:'val'});
	t.equal(o['title'], 'log');
	t.equal(o['file'], '');//the format don't include "file", so can't get it
	t.equal(o['output'], 'hello world 123 {"j":"val"} { t: \'val\' }');
	t.end();
})

test("custom format", function(t) {
	var logger = require('../').console({
		format : [
		          "{{message}}", // default format
		          {
		        	  warn : "warn:{{message}}",
		        	  error : "error:{{message}}",
		          }
		],
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	var o = logger.log('hello %s %d', 'world', 123);
	t.equal(o['output'], 'hello world 123');
	o = logger.warn('hello %s %d', 'world', 123);
	t.equal(o['output'], 'warn:hello world 123');
	o = logger.error('hello %s %d', 'world', 123);
	t.equal(o['output'], 'error:hello world 123');
	t.end();
})

test("custom filter",function(t) {
	var colors = require('colors');
	var logger = require('../').console({
		format : [
		          "{{message}}", // default format
		          {
		        	  warn : "warn:{{message}}",
		        	  error : "error:{{message}}",
		          }
		],
		filters:[
		colors.underline,
        {
     	   warn : colors.yellow,
     	   error : [colors.red, colors.bold ]
        }],
        transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	var o = logger.log('hello %s %d', 'world', 123);
	t.equal(o['output'], '\u001b[4mhello world 123\u001b[24m');
	t.equal(o['level'], 0);
	o = logger.warn('hello %s %d', 'world', 123);
	t.equal(o['output'], '\u001b[33mwarn:hello world 123\u001b[39m');
	t.equal(o['level'], 4);
	o = logger.error('hello %s %d', 'world', 123);
	t.equal(o['output'], '\u001b[1m\u001b[31merror:hello world 123\u001b[39m\u001b[22m');
	t.equal(o['level'], 5);
	t.end();
})

test("set level to log", function(t) {
	var logger = require('../').console({level:'log',
		transport : function(data) {
			return data;
		}
	});
	t.ok(logger.log('hello'));
	t.ok(logger.trace('hello', 'world'));
	t.ok(logger.debug('hello %s',  'world', 123));
	t.ok(logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.end();
})
test("set level to 0", function(t) {
	var logger = require('../').console({level:0,
		transport : function(data) {
			return data;
		}
	});
	t.ok(logger.log('hello'));
	t.ok(logger.trace('hello', 'world'));
	t.ok(logger.debug('hello %s',  'world', 123));
	t.ok(logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.end();
})
test("set level to 2", function(t) {
	var logger = require('../').console({level:2,
		transport : function(data) {
			return data;
		}
	});
	t.ok(!logger.log('hello'));
	t.ok(!logger.trace('hello', 'world'));
	t.ok(logger.debug('hello %s',  'world', 123));
	t.ok(logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.end();
})
test("set level to warn",function(t) {
	var logger = require('../').console({level:'warn',
		transport : function(data) {
			return data;
		}
	});
	t.ok(!logger.log('hello'));
	t.ok(!logger.trace('hello', 'world'));
	t.ok(!logger.debug('hello %s',  'world', 123));
	t.ok(!logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.end();
})
test("set level to error", function(t) {
	var logger = require('../').console({level:'error',
		transport : function(data) {
			return data;
		}
	});
	t.ok(!logger.log('hello'));
	t.ok(!logger.trace('hello', 'world'));
	t.ok(!logger.debug('hello %s',  'world', 123));
	t.ok(!logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(!logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.end();
})
test("set level to max value", function(t) {
	var logger = require('../').console({level:Number.MAX_VALUE,
		transport : function(data) {
			return data;
		}
	});
	t.ok(!logger.log('hello'));
	t.ok(!logger.trace('hello', 'world'));
	t.ok(!logger.debug('hello %s',  'world', 123));
	t.ok(!logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(!logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(!logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.end();
})

test("loop", function(t) {
	var logger = require('../').console({
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	for(var i=0; i<100; i++){
		var o = logger.info('hello');
		t.equal(o['message'], 'hello');
		t.equal(o['file'], 'test.js');
		t.equal(o['line'], '252');
		t.equal(o['level'], 3);

	}
	t.end();
})

test("setLevel 1", function(t) {
	var logger = require('../').console({
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	require('../').setLevel(2);
	t.ok(!logger.log('hello'));
	t.ok(!logger.trace('hello', 'world'));
	t.ok(logger.debug('hello %s',  'world', 123));
	t.ok(logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.end();

})

test("setLevel 2", function(t) {
	var logger = require('../').console({
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	require('../').setLevel('debug');
	t.ok(!logger.log('hello'));
	t.ok(!logger.trace('hello', 'world'));
	t.ok(logger.debug('hello %s',  'world', 123));
	t.ok(logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
  t.end();
})


test("close", function(t) {
	var logger = require('../').console({
		transport : function(data) {
			console.log(data.output);
			return data;
		}
	});
	require('../').close();
	t.ok(!logger.log('hello'));
	t.ok(!logger.trace('hello', 'world'));
	t.ok(!logger.debug('hello %s',  'world', 123));
	t.ok(!logger.info('hello %s %d',  'world', 123, {foo:'bar'}));
	t.ok(!logger.warn('hello %s %d %j', 'world', 123, {foo:'bar'}));
	t.ok(!logger.error('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object));
	t.ok(!logger.fatal('hello %s %d %j', 'world', 123, {foo:'bar'}, [1, 2, 3, 4], Object, logger));
  t.end();
})
