'use strict';

var joi = require('joi');

module.exports.request = joi.object({
    '@timestamp': joi.date().required(),
    servicetype: joi.string().valid('myservice').required(),
    logname: joi.string().valid('request').required(),
    formatversion: joi.string().valid('v1').required(),
    type: joi.string().valid('myservice-request-v1').required(),
    host: joi.string().required(),
    sequencenumber: joi.number().integer().min(0).required(),
    method: joi.string().valid(['get', 'post', 'put']).required(),
    url: joi.string().valid('/foo').required(),
    query: joi.object({
        active: joi.boolean().required(),
        ids: joi.array().required()
    }).required(),
    status: joi.number().valid(200).required(),
    duration: joi.number().integer().required(),
    durationMilliseconds: joi.number().integer().required(),
    events: joi.array().required(),
    payload: joi.string(),

    "ot-requestid": joi.string().valid("67c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce").required(),
    "user-agent": joi.string().valid("ot").required(),
    "ot-userid": joi.string().valid("12c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce").required(),
    "ot-sessionid": joi.string().valid("34c07bb9-8ad8-4bc2-848f-3cc3a2fb92ce").required(),
    "ot-referringhost": joi.string().valid("oc").required(),
    "ot-referringservice": joi.string().valid("listing").required(),
    "accept-language": joi.string().valid("en-US, *").required(),
    headers: joi.object().required(),
    meta: joi.object().keys({
        key: 'value'
    }).required()
});

module.exports.log = joi.object({
    "@timestamp": joi.date().required(),
    servicetype: joi.string().valid('myservice').required(),
    logname: joi.string().valid('log').required(),
    formatversion: joi.string().valid('v1').required(),
    type: joi.string().valid('myservice-log-v1').required(),
    host: joi.string().required(),
    sequencenumber: joi.number().integer().min(0).required(),
    data: joi.object().required(),
    tags: joi.array().includes(joi.string()).required()
});

module.exports.error = joi.object({
    "@timestamp": joi.date().required(),
    servicetype: joi.string().valid('myservice').required(),
    logname: joi.string().valid('error').required(),
    formatversion: joi.string().valid('v1').required(),
    type: joi.string().valid('myservice-error-v1').required(),
    host: joi.string().required(),
    sequencenumber: joi.number().integer().min(0).required(),
    err: joi.object().required()
});
