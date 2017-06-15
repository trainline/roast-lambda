/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let assert = require('assert');
let logging = require('../src/logging.js');
let MockTraceService = require('./testDoubles/mockTraceService')

describe('logging', () => {
  let logger, lastEntry, mockTraceService;

  let segment = { name: 'testService', id: '1', trace_id: 'xyz' };
  let logFn = val => lastEntry = JSON.parse(val);

  beforeEach(() => {
    lastEntry = {};
    mockTraceService = MockTraceService.create();
    logger = logging.createLogger({ segmentName: 'testService', parentSegmentDetails: segment, logFn, traceService: mockTraceService, event: 'event' });
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

  it('should create a segment on construction', () => {
    assert.ok(mockTraceService.segmentsCreated.length === 1);
    assert.ok(mockTraceService.segmentsCreated[0].metadata[0].key === 'Event');
    assert.ok(mockTraceService.segmentsCreated[0].metadata[0].value === 'event');
  });

  it('should log the service name and segment details', () => {
    logger.log('message');
    assert.ok(lastEntry['service-name'] === segment.name);
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

  it('should create a new logger with new segment when createSubLogger is called', () => {
    let subLogger = logger.createSubLogger({ segmentName: 'subService', event: 'subEvent' });
    assert.ok(logger != subLogger);
    assert.ok(mockTraceService.segmentsCreated.length === 2);
    assert.ok(mockTraceService.segmentsCreated[0] != mockTraceService.segmentsCreated[1]);
    assert.ok(mockTraceService.segmentsCreated[1].metadata[0].value === 'subEvent');
  });

  it('should close the segment when the logger is closed', () => {
    logger.close('Result', 'result');
    assert.ok(mockTraceService.segmentsCreated[0].isClosed());
    assert.ok(mockTraceService.segmentsCreated[0].metadata[1].key === 'Result');
    assert.ok(mockTraceService.segmentsCreated[0].metadata[1].value === 'result');
  });
});