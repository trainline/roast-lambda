/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
let process = require('process');
let _ = require('lodash');

let AWS = require('aws-sdk');

let logging = require('./logging');
let tracing = require('./tracing')
let { safePromise, parseError } = require('./utils');

function runLambda(lambda, event, awsContext) {
  let context = getContextData(awsContext);

  let logger = logging.createLogger({
    segmentName: context.functionName,
    segmentAnnotations: lambda.xRaySegmentAnnotations,
    parentSegmentDetails: {
      trace_id: _.get(event, 'headers["TRACE-ID"]'),
      id: _.get(event, 'headers["TRACE-PARENT-SEGMENT"]')
    },
    event: event,
    logFn: console.log,
    traceService: tracing.createService()
  });

  logger.info(`Function started`, event);
  
  return safePromise(() => lambda.handler({ event, context, logger, AWS }))
    .then((result) => {
      let message = `Function completed successfully`;
      logger.info(message, result);
      logger.close('Result', result);
      return result || message;
    })
    .catch((error) => {
      let err = parseError(error);
      let message = `Function failed: ${err.message}`;
      logger.error(message, err.errorData);
      logger.close('Error', err.errorData);
      return Promise.reject(message);
    });
}

function getContextData(awsContext) {
  let context = JSON.parse(JSON.stringify(awsContext));
  let fnArnParts = context.invokedFunctionArn.split(':');
  
  context.awsAccountId = Number(fnArnParts[4]);
  context.awsRegion = fnArnParts[3];
  context.env = process.env;

  return context;
}

module.exports = {
  init: (lambda) => {
    return (event, context, callback) => {
      return runLambda(lambda, event, context)
        .then(result => callback(null, result))
        .catch(error => callback(error));
    };
  }
};