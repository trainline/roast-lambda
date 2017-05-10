let process = require('process');
let _ = require('lodash');

let AWSXRay = require('aws-xray-sdk');
let AWS = AWSXRay.captureAWS(require('aws-sdk'));

let loggerFactory = require('./logger');
let awsLoggerFactory = require('./aws-logger');

let { safePromise, parseError } = require('./utils');

function runLambda(lambda, event, awsContext) {
  let context = getContextData(awsContext);

  let segment = startSegment(event, context.functionName);
  
  _.forIn(lambda.xRaySegmentAnnotations,
    (value, key) => segment.addAnnotation(key, value));

  segment.addMetadata('Event', event);

  let logger = loggerFactory.createLogger({ segment });
  AWS.config.logger = awsLoggerFactory.createLogger(logger);

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

function closeSegment(segment, key, value) {
  segment.addMetadata(key, value);
  segment.close();
}

function startSegment(event, functionName) {
  if (!isHttpRequest(event))
    return createAndSetSegment(functionName);

  let traceId = event.params.header['TRACE-ID'];
  let segmentId = event.params.header['TRACE-PARENT-SEGMENT'];
  
  return createAndSetSegment(functionName, traceId, segmentId);
}

function createAndSetSegment(functionName, traceId, segmentId) {
  let segment = new AWSXRay.Segment(functionName, traceId, segmentId);
  AWSXRay.setSegment(segment);
  return segment;
}

function isHttpRequest(request) {
  return request && request.params && request.params.header;
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
      return runLambda(lambda, event, context)
        .then(result => callback(null, result))
        .catch(error => callback(error));
    };
  }
};