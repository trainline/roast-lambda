'use strict'

function createLogger(logger) {
  function log(fn, val) {
    fn(val, null, { source: 'aws-sdk' });
  }
  return {
    error: (val) => log(logger.error, val),
    warn:  (val) => log(logger.warn,  val),
    info:  (val) => log(logger.info,  val),
    log:   (val) => log(logger.info,  val),
    debug: (val) => log(logger.debug, val)
  };
}

module.exports = { createLogger };