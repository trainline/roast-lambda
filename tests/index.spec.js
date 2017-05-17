/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict';

let assert = require('assert');
let roast = require('../src/index')

describe('Roast Lambda Runner', () => {
  let lambda = function () {};
  let event = {
      keepRunning: true
  };
  let awsContext = {
      functionName: 'test',
      invokedFunctionArn: 'a:b:c:d:e:f'
  };
  let cooked;

  beforeEach(() => {
    cooked = roast.init(lambda);
  });

  it('should return no action taken when told to keep running', (done) => {
    cooked(event, awsContext, () => {})
        .then(result => {
            assert.ok(result === 'No Action Taken.');
        })
        .then(done);
  });
});
