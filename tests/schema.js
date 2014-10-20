var joi = require('joi');

module.exports.request = joi.object({
  "@timestamp": joi.date().required(),
  servicetype: joi.string().valid('myservice').required(),
  logname: joi.string().valid('request').required(),
  formatversion: joi.string().valid('v1').required(),
  type: joi.string().valid('myservice-request-v1').required(),
  host: joi.string().required(),
  sequencenumber: joi.number().integer().min(0).required(),
  status: joi.number().valid(200).required(),
  duration: joi.number().integer().required(),
  durationMilliseconds: joi.number().integer().required(),
  events: joi.array().required(),
  method: joi.string().valid('get').required(),
  url: joi.string().valid('/foo').required(),
  query: joi.object({
    flarg: joi.string().valid('glarg').required()
  }).required(),

  "ot-requestid": joi.string().valid("abcd-1234-abcd-1234").required(),
  "user-agent": joi.string().valid("tests").required(),
  "ot-userid": joi.string().valid("user1234").required(),
  "ot-sessionid": joi.string().valid("1234-abcd-1234-abcd").required(),
  "ot-referringhost": joi.string().valid("referringhost").required(),
  "ot-referringservice": joi.string().valid("referringservice").required(),
  "accept-language": joi.string().valid("en-GB,en;q=0.8").required(),
  headers: joi.object()
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
