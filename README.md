# hapi-ot-logger
> OpenTable standard-compliant logging plugin for Hapi.

[![Build Status](https://travis-ci.org/opentable/hapi-ot-logger.svg?branch=master)](https://travis-ci.org/opentable/hapi-ot-logger)
[![Dependency Status](https://david-dm.org/opentable/hapi-ot-logger.svg)](https://david-dm.org/opentable/hapi-ot-logger)
[![devDependency Status](https://david-dm.org/opentable/hapi-ot-logger/dev-status.svg)](https://david-dm.org/opentable/hapi-ot-logger#info=devDependencies)
[![npm version](https://badge.fury.io/js/hapi-ot-logger.svg)](https://badge.fury.io/js/hapi-ot-logger)

## Usage
```
$ npm i hapi-ot-logger --save
```

```
var server = new (require('hapi').Server)();
server.connection({ port: 3000 });

server.register([
    {
        register: require('hapi-ot-logger'),
        options: {
          servicetype: "myservice",
          versions: {
            request: 'v2',
            log: 'v3',
            error: 'v2'
          },
          redis: {
            host: '127.0.0.1',
            port: 6379,
            listname: 'logs'
          },
          console: true,
          payload: false,
          validate: function(log) {
            return log.logname === 'request' && log.headers['user-agent'] !== 'noisy-spider';
          },
          preSend: function(req, log) {
            log.customAttribute = req.context.someAttribute;
          }
        }
    }
], function (err) {
    if (err) {
        console.error('Failed to load plugin:', err);
    }

    server.start();
});
```

## Configuration
- **servicetype** - unique service type
- **versions** -  
    - **request** - request log version
    - **log** - diagnostic log version
    - **error** - error log version
- **redis**
    - **host** - redis server hostname or IP address
    - **port** - redis server port
    - **listname** - redis list name
- **console** - *(optional)* enable console output for debugging
- **payload** - *(optional)* include request payload
- **validate** - *(optional)* validates that a message should be logged
- **preSend** - *(optional)* enables modification of log message

## Release History
- **v3.1.0** (1026-07-XX)
    - added optional `preSend(req, log)` function to enable modification of log message
- **v3.0.0** (2015-11-14)
    - ???
