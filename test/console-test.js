/*eslint-env mocha*/
'use strict';

const { assert, sinon } = require('@sinonjs/referee-sinon');
const logger = require('@studio/log');
const Console = require('../console');

describe('console', () => {
  let clock;
  let log;
  let consoleLog;

  beforeEach(() => {
    log = logger('test');
    clock = sinon.useFakeTimers();
    consoleLog = sinon.fake();
    logger.pipe(new Console({ log: consoleLog }));
    clock.tick(123);
  });

  afterEach(() => {
    sinon.restore();
    logger.reset();
  });

  it('formats ts, topic, ns and msg', () => {
    log.broadcast('Oh, hi!');

    assert.calledWith(consoleLog, '01:00:00.123 📣 test', 'Oh, hi!');
  });

  it('formats time with two digit numbers', () => {
    clock.tick(1530286522511);

    log.timing();

    assert.calledWith(consoleLog, '17:35:22.634 ⏱ test');
  });

  it('formats time with one digit millis', () => {
    clock.tick(880);

    log.timing();

    assert.calledWith(consoleLog, '01:00:01.003 ⏱ test');
  });

  it('formats time with two digit millis', () => {
    clock.tick(890);

    log.timing();

    assert.calledWith(consoleLog, '01:00:01.013 ⏱ test');
  });

  it('formats msg and data object', () => {
    log.broadcast('Data', { some: 'string', and: 42 });

    assert.calledWith(consoleLog, '01:00:00.123 📣 test', 'Data', {
      some: 'string',
      and: 42
    });
  });

  it('formats msg and data string', () => {
    log.broadcast('Data', 'Also data');

    assert.calledWith(consoleLog, '01:00:00.123 📣 test', 'Data', 'Also data');
  });

  it('formats msg and data number', () => {
    log.broadcast('Data', 1234);

    assert.calledWith(consoleLog, '01:00:00.123 📣 test', 'Data', 1234);
  });

  it('formats just data', () => {
    log.broadcast({ some: 'string', and: 42 });

    assert.calledWith(consoleLog, '01:00:00.123 📣 test', {
      some: 'string',
      and: 42
    });
  });

  it('formats msg and error', () => {
    const error = new Error('Ouch!');

    log.error('Oups', error);

    assert.calledWith(consoleLog, '01:00:00.123 🚨 test', 'Oups', error.stack);
  });

  it('formats msg and error with cause', () => {
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.error('Oups', error);

    assert.calledWith(consoleLog, '01:00:00.123 🚨 test', 'Oups', error.stack,
      cause.stack);
  });

  it('formats just error', () => {
    const error = new Error('Ouch!');

    log.error(error);

    assert.calledWith(consoleLog, '01:00:00.123 🚨 test', error.stack);
  });

});
