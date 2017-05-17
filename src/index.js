/* Copyright (c) Trainline Limited, 2017. All rights reserved. See LICENSE.txt in the project root for license information. */
let process = require('process');
let _ = require('lodash');

let AWSXRay = require('aws-xray-sdk');
let AWS = AWSXRay.captureAWS(require('aws-sdk'));

let logging = require('./logging');
let awsLogging = require('./aws-logging');

let { safePromise, parseError } = require('./utils');

function runLambda(lambda, event, awsContext) {
  let context = getContextData(awsContext);
  let segment = startSegment(event, context.functionName);

  _.forIn(lambda.xRaySegmentAnnotations,
    (value, key) => segment.addAnnotation(key, value));

  segment.addMetadata('Event', event);

  let logger = logging.createLogger({ segment });
  AWS.config.logger = awsLogging.createLogger(logger);

  logger.info(`Function started`, event);

  return safePromise(() => lambda.handler({ event, context, logger, AWS }))
    .then((result) => {
      logger.info(`Function completed`, result);
      closeSegment(segment, 'Result', result);
      return result;
    })
    .catch((error) => {
      let err = parseError(error);
      logger.error(`Function failed: ${err.message}`, err.errorData);
      segment.error = true;
      closeSegment(segment, 'Error', err.errorData);
      return Promise.reject(error);
    });
}

/**
 * If you want to just 'prod' the lambda container to keep it alive,
 *  you can pass 'keepRunning' on the event.
 */
function keepLambdaRunning(event) {
  if (event.keepRunning) return true;
  else return false;
}

function startSegment(event, functionName) {
  let traceId = _.get(event, 'params.header["TRACE-ID"]');
  let segmentId = _.get(event, 'params.header["TRACE-PARENT-SEGMENT"]');

  let segment = new AWSXRay.Segment(functionName, traceId, segmentId);
  AWSXRay.setSegment(segment);

  return segment;
}

function closeSegment(segment, key, value) {
  segment.addMetadata(key, value);
  segment.close();
}

function getContextData(awsContext) {
  let context = JSON.parse(JSON.stringify(awsContext));
  let fnArnParts = context.invokedFunctionArn.split(':');

  context.awsAccountId = fnArnParts[4];
  context.awsRegion = fnArnParts[3];
  context.env = process.env;

  return context;
}

module.exports = {
  init: (lambda) => {
    return (event, context, callback) => {
      if (keepLambdaRunning(event))
        return Promise.resolve('No Action Taken.');

      return runLambda(lambda, event, context)
        .then(result => callback(null, result))
        .catch(error => callback(error));
    };
  }
};