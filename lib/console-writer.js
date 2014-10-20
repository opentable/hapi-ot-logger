var stringifySafe = require("json-stringify-safe");

module.exports.log = function(log){
  var query = log.query ? stringifySafe(log.query) : '{}';
    var responsePayload = '';
    var statusCode = '';
    var duration = '';

    var methodColors = {
        get: 32,
        delete: 31,
        put: 36,
        post: 33
    };
    var color = methodColors[log.method] || 34;
    var method = '\x1b[1;' + color + 'm' + log.method + '\x1b[0m';

    if (log.status) {
        color = 32;
        if (log.status >= 500) {
            color = 31;
        } else if (log.status >= 400) {
            color = 33;
        } else if (log.status >= 300) {
            color = 36;
        }
        statusCode = '\x1b[' + color + 'm' + log.status + '\x1b[0m';
    }

    if(log.durationMilliseconds){
      duration = log.durationMilliseconds + 'ms';
    }

    if(log.logname === 'request'){
      return console.log([log["@timestamp"], log.logname, method, log.url, query, statusCode, duration].join(", "));
    }

    console.log([log["@timestamp"], log.logname, stringifySafe(log.err || log.data)].join(", "))
}
