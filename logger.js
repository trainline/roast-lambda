/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict'

let _ = require('lodash');

function createLogger({ segment, logFn }) {
  let write = logFn || console.log;

  function log (level, entry, details, attrs) {
    let logEntry = {
      'level': level,
      'entry': json(entry),
      'service-name': segment.name,
      'segment-id': segment.id,
      'trace-id': segment.trace_id,
      'details': json(details),
      'source': 'service'
    };

    if (attrs) Object.assign(logEntry, attrs);    
    write(JSON.stringify(logEntry, null, 2));
  }

  function json(val) {
    return _.isObjectLike(val) ? JSON.stringify(val, null, 2) : val;
  }

  return {
    error: (...args) => log('error', ...args),
    warn:  (...args) => log('warn',  ...args),
    info:  (...args) => log('info',  ...args),
    log:   (...args) => log('info',  ...args),
    debug: (...args) => log('debug', ...args),
    segment: { id: segment.id, traceId: segment.trace_id }
  };
}

module.exports = { createLogger };