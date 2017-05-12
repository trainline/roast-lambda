# Roast Lambda

![Build status](https://travis-ci.org/trainline/roast-lambda.svg?branch=master)

Roast Lambda is an opinionated framework written by the engineers at [The Trainline](https://engineering.thetrainline.com/) which makes writing NodeJS AWS Lambda functions easier and which facilitates best practices when building micro-service based serverless solutions.

*Note: Roast Lambda is currently in development and should be considered unstable until v1. We are currently testing this approach with our own internal services.*

## Getting started

Our lambda functions look slightly different to traditional AWS Lambda functions. To understand the differences (and why we chose them) read the [What's Roast Lambda?](#whats-roast-lambda) section.

Here's the obligatory hello world example:

```js
exports.handler = () => Promise.resolve('Hello World');
```

Create the node module above with the name 'hello-world.js'. Next we need to convert this to a Lambda that AWS will recognise. Start by installing the framework as a dependency..

```sh
npm install roast-lambda --save
```

Roast your lambda in the oven, and then serve...

```js
let rl = require('roast-lambda');
let lambda = require('./hello-world.js');

exports.handler = rl.init(lambda);
```

## What's Roast Lambda?

It's a tiny adapter which takes an easy-to-write module, containing lambda configuration and code, and turns it into something that AWS can run. By default, native AWS Lambdas require the developer to write a lot of boilerplate code (such as error handling, logging, tracing etc.). The adapter adds the boilerplate so that we don't have to. The result is that our Lambda modules are simpler to write - which is important if you're writing lots of them.

Specifically the adapter adds:

- Proper promise support and the elimination of callbacks
- A standard logging format for structured and non-structured logs
- Integration of AWS CloudWatch logs with ElasticSearch and Kibana
- Synchronous and asynchronous exception handling
- Inter-micro-service event tracing using AWS X-Ray
- Extended context info and easy access to environment variables

For more information see our [docs](https://github.com/trainline/roast-lambda/tree/master/docs).