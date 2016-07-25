
'use strict';

var joi = require('joi');

module.exports = {
    servicetype: joi.string(),
    versions: joi.object().keys({
        request: joi.string(),
        log: joi.string(),
        error: joi.string()
    }).required(),
    redis: joi.object().keys({
        host: joi.string(),
        port: joi.number(),
        listname: joi.string()
    }).required(),
    console: joi.boolean(),
    payload: joi.boolean(),
    validate: joi.func(),
    preSend: joi.func()
};
