/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

function createMockTraceService() {
  let segmentsCreated = [];

  function createSegment(name, parentTraceId, parentSegmentId) {
    let metadata = [];
    let isClosed = false;
    let segment = {
      name,
      id: 'id',
      trace_id: parentTraceId,
      addMetadata: (key, value) => metadata.push({ key, value }),
      close: () => isClosed = true,
      isClosed: () => isClosed,
      metadata
    };
    segmentsCreated.push(segment);
    return segment;
  }

  return { createSegment, segmentsCreated };
}

module.exports = { create: createMockTraceService };