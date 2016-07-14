'use strict';

let os = require('os'),
    redis = require('redis'),
    hoek = require('hoek'),
    stringifySafe = require('json-stringify-safe'),
    consoleWriter = require('./console-writer'),
    once = require('lodash.once'),
    client,
    cfg,
    connectionTimer,
_commonFields = (log, type) => {
    const fields = {
        '@timestamp': (new Date()).toISOString(),
        servicetype: cfg.servicetype,
        logname: type,
        formatversion: cfg.versions[type],
        type: cfg.servicetype + '-' + type + '-' + cfg.versions[type],
        host: cfg.host,
        sequencenumber: cfg.sequencenumber
    };

    return hoek.applyToDefaults(fields, log);
},
_dispatch = log => {
    if (cfg.validate && !cfg.validate(log)) {
        return;
    }

    if(cfg.console){
        consoleWriter.log(log);
    }

    client.rpush(cfg.redis.listname, stringifySafe(log), () => {});
    cfg.sequencenumber++;
};

module.exports.config = (config, cb) => {
    const callback = once(cb);
    const defaults = {
        redis: {
            host: '127.0.0.1',
            port: 6379
        },
        servicetype: 'myservice',
        versions: {
            request: 'v1',
            log: 'v1',
            error: 'v1'
        },
        console: false,
        payload: false,
        sequencenumber: 1,
        host: os.hostname()
    };

    cfg = hoek.applyToDefaults(defaults, config);

    client = redis.createClient(cfg.redis.port, cfg.redis.host, {
        enable_offline_queue: false
    });

    client.on('error', () => {});

    connectionTimer = setTimeout(callback, 2000);
    client.on('ready', () =>{
        clearTimeout(connectionTimer);
        callback();
    });
};

module.exports.request = request => {
    _dispatch(_commonFields({
        method: request.method,
        url: request.path,
        query: request.query,
        payload: cfg.payload ? stringifySafe(request.payload) : null,
        status: request.response ? request.response.statusCode : 0,
        duration: (Date.now() - request.info.received) * 1000, // just to be compliant. sigh
        durationMilliseconds: Date.now() - request.info.received,
        events: request.getLog(),

        'ot-requestid': request.headers['ot-requestid'],
        'user-agent': request.headers['user-agent'],
        'ot-userid': request.headers['ot-userid'],
        'ot-sessionid': request.headers['ot-sessionid'],
        'ot-referringhost': request.headers['ot-referringhost'],
        'ot-referringservice': request.headers['ot-referringservice'],
        'accept-language': request.headers['accept-language'],
        headers: request.headers // log anything else that is not pulled up
    }, 'request'));
};

module.exports.log = event => {
    _dispatch(_commonFields({
        data: event.data,
        tags: event.tags
    }, 'log'));
};

module.exports.error = (request, err) => {
    _dispatch(_commonFields({
        err
    }, 'error'));
};
