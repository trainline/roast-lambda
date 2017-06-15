/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict'

let AWSXRay = require('aws-xray-sdk-core');

function create() {
  function createSegment(name, parentTraceId, parentSegmentId) {
    return new AWSXRay.Segment(name, parentTraceId, parentSegmentId);
  }

  return { createSegment };
}

module.exports = { create };