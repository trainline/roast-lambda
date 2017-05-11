/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict'

let assert = require('assert');
let { safePromise, parseError } = require('../src/utils');

describe('error handling', () => {
  it('should handle synchronous errors as promise rejections', () => {
    let throwingAsyncFn = () => { throw 'Bang!'; };
    let runTask = safePromise(throwingAsyncFn);
    runTask
      .then(() => { throw 'Promise not rejected!'; })
      .catch(err => assert.ok(err === 'Bang!'));
  });

  it('should parse thrown errors', () => {
    try { throw new Error('Bang!'); } catch (error) {
      let parsedError = parseError(error);
      assert.equal(parsedError.message, 'Bang!');
      assert.equal(parsedError.errorData.error, 'Error: Bang!');
      assert.ok(parsedError.errorData.stackTrace.length > 0);
    }
  });

  it('should parse thrown objects', () => {
    let testObject = { key: 'Boom!' };
    try { throw testObject; } catch (error) {
      let parsedError = parseError(error);
      assert.equal(parsedError.errorData, testObject);
      assert.equal(parsedError.message, 'Unhandled exception. See details.');
    }
  });

  it('should parse error as message from thrown objects if present', () => {
    let testObject = { error: 'Boom!' };
    try { throw testObject; } catch (error) {
      let parsedError = parseError(error);
      assert.equal(parsedError.message, 'Boom!');
    }
  });

  it('should parse thrown primitives', () => {
    let testString = 'Boom!';
    try { throw testString; } catch (error) {
      let parsedError = parseError(error);
      assert.equal(parsedError.message, testString);
      assert.equal(parsedError.errorData, testString);
    }
  });
});