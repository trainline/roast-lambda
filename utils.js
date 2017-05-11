/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
'use strict'

let _ = require('lodash');

function safePromise(fn) {
  return new Promise((resolve, reject) => {
    try {
      fn()
        .then(result => resolve(result))
        .catch(error => reject(error));
    } catch (error) {
      reject(error);
    }
  });
}

function parseError(error) {
  if (error instanceof Error) {
    let message = error.message;
    let stack = error.stack.split('\n').map(s => s.trim().slice(3)).slice(1);
    let errorData = { error: error.toString(), stackTrace: stack };
    return { message, errorData };
  }

  if (_.isObjectLike(error)) {
    return { message: error.error || 'Unhandled exception. See details.', errorData: error };
  }

  return { message: error, errorData: error };
}

module.exports = { safePromise, parseError };