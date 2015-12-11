#Hapi-ot-logger
[![Build Status](https://travis-ci.org/opentable/hapi-ot-logger.png?branch=master)](https://travis-ci.org/opentable/hapi-ot-logger) [![NPM version](https://badge.fury.io/js/hapi-ot-logger.png)](http://badge.fury.io/js/hapi-ot-logger) ![Dependencies](https://david-dm.org/opentable/hapi-ot-logger.png)

Hapi plugin for ot-logging standards.

Currently only supports redis.

installation:

```shell
npm install hapi-ot-logger
```

usage:

```javascript
var hapi = require("hapi");

var server = Hapi.createServer('127.0.0.1', 3000, {});

server.pack.register([
  {
    plugin: require('hapi-ot-logger'),
    options: {
      servicetype: "myservice",
      versions: { // defaults to v1
        request: 'v2',
        log: 'v3',
        error: 'v2'
      },
      redis: {
        host: '127.0.0.1',
        port: 6379,
        listname: 'logs'
      },
      console: true, // optional console output for debugging, default: false
      payload: false, // include the request payload (request.payload stringified), default: false
      validate: function(log) { // validates that a message should be logged (default to always valid)
        return log.logname === 'request' && log.headers['user-agent'] !== 'noisy-spider';
      }
    }
  }], function(err){
    if(err){
      throw err;
    }

    server.start(function(){
      server.log('server started');
    });
});

```
