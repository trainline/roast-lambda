/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let assert = require('assert');
let logging = require('../src/logging.js');

describe('logger', () => {
  let logger, lastEntry;

  let segment = { name: 'testService', id: '1', trace_id: 'xyz' };
  let logFn = val => lastEntry = JSON.parse(val);

  beforeEach(() => {
    lastEntry = {};
    logger = logging.createLogger({ segment, logFn });
  });

  it('should log simple messages', () => {
    let testMessage = 'sampleMessage';
    logger.log(testMessage);
    assert.ok(lastEntry.entry === testMessage);
  });

  let logLevels = ['error', 'warn', 'info', 'debug'];

  logLevels.forEach((level) => {
    it(`should log ${level} logs`, () => {
      logger[level]('message');
      assert.ok(lastEntry.level === level);
    });
  });

  it('should log the service name and segment details', () => {
    logger.log('message');
    assert.ok(lastEntry['service-name'] === segment.name);
    assert.ok(lastEntry['segment-id'] === segment.id);
    assert.ok(lastEntry['trace-id'] === segment.trace_id);
  });

  it('should log the source as "service" by default', () => {
    logger.log('message');
    assert.ok(lastEntry.source === 'service');
  });

  it('should not log details by default', () => {
    logger.log('message');
    assert.ok(lastEntry.details === undefined);
  });

  it('should log details when supplied', () => {
    let details = 'test details';
    logger.log('message', details);
    assert.ok(lastEntry.details === details);
  });

  it('should json serialise complex details', () => {
    let details = { key: 'value' };
    logger.log('message', details);
    assert.deepEqual(JSON.parse(lastEntry.details), details);
  });

  it('should log attributes when supplied', () => {
    let testAttributeValue = 'value';
    logger.log('message', null, { attr: testAttributeValue });
    assert.ok(lastEntry.attr === testAttributeValue);
  });

  it('should json serialise complex messages', () => {
    let testObject = { key: 'value' };
    logger.log(testObject);
    assert.ok(JSON.parse(lastEntry.entry).key === testObject.key);
  });
});