/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict'

let _ = require('lodash');

function createLogger({ segmentName, traceAnnotations, parentSegmentDetails, event, logFn, traceService }) {
  let parentSegment = Object.assign({}, parentSegmentDetails);
  let segment = traceService.createSegment(segmentName, parentSegment.trace_id, parentSegment.id);
  
  segment.addMetadata('Event', event);
  _.forIn(traceAnnotations, (value, key) => segment.addAnnotation(key, value));

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
    logFn(JSON.stringify(logEntry, null, 2));
  }

  function closeSegment(key, value) {
    segment.addMetadata(key, value);
    segment.close();
  }

  function createSubLogger(args) {
    return createLogger({
      segmentName: args.segmentName,
      traceAnnotations: traceAnnotations,
      parentSegmentDetails: segment,
      event: args.event,
      logFn: logFn,
      traceService
    });
  }

  return {
    error: (...args) => log('error', ...args),
    warn:  (...args) => log('warn',  ...args),
    info:  (...args) => log('info',  ...args),
    log:   (...args) => log('info',  ...args),
    debug: (...args) => log('debug', ...args),
    close: closeSegment,
    createSubLogger: createSubLogger
  };
}

function json(val) {
  return _.isObjectLike(val) ? JSON.stringify(val, null, 2) : val;
}

module.exports = { createLogger };