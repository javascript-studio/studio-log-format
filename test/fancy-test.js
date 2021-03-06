/*eslint-env mocha*/
'use strict';

const { assert, refute, sinon } = require('@sinonjs/referee-sinon');
const chalk = require('chalk');
const { Writable } = require('stream');
const logger = require('@studio/log');
const Formatter = require('../fancy');

describe('fancy', () => {
  const date_time = new Date(123).toLocaleString();
  const local_time = chalk.gray('01:00:00.123');
  const namespace = chalk.blue('test');

  let clock;
  let log;
  let out;
  let stream;

  beforeEach(() => {
    log = logger('test');
    out = '';
    clock = sinon.useFakeTimers();
    stream = new Writable({
      write(chunk, enc, done) {
        out += chunk;
        done();
      }
    });
    logger.pipe(new Formatter()).pipe(stream);
    clock.tick(123);
  });

  afterEach(() => {
    sinon.restore();
    logger.reset();
  });

  it('formats ts, topic, ns and msg', () => {
    log.broadcast('Oh, hi!');

    assert.equals(out, `${local_time} 📣 ${namespace} Oh, hi!\n`);
  });

  it('formats data object', () => {
    log.broadcast('Data', { some: 'string', and: 42 });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'string\'')} `
      + `${chalk.bold('and')}=${chalk.yellow('42')}\n`);
  });

  it('formats data string', () => {
    log.broadcast('Data', 'Also string');

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.green('\'Also string\'')}\n`);
  });

  it('formats data number', () => {
    log.broadcast('Data', 1234);

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.yellow('1234')}\n`);
  });

  it('formats data boolean', () => {
    log.broadcast('Data', true);

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.yellow('true')}\n`);
  });

  it('escapes quotes in string', () => {
    log.broadcast('Data', { some: 'str\'in\'g' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\\'in\\\'g\'')}\n`);
  });

  it('escapes \\n in string', () => {
    log.broadcast('Data', { some: 'str\nin\ng' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\nin\\ng\'')}\n`);
  });

  it('escapes \\r\\n in string', () => {
    log.broadcast('Data', { some: 'str\r\nin\r\ng' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\r\\nin\\r\\ng\'')}\n`);
  });

  it('escapes \\t in string', () => {
    log.broadcast('Data', { some: 'str\tin\tg' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\tin\\tg\'')}\n`);
  });

  it('escapes \\a in string', () => {
    log.broadcast('Data', { some: 'str\x07in\x07g' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\ain\\ag\'')}\n`);
  });

  it('escapes \\b in string', () => {
    log.broadcast('Data', { some: 'str\bin\bg' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\bin\\bg\'')}\n`);
  });

  it('escapes \\v in string', () => {
    log.broadcast('Data', { some: 'str\vin\vg' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\vin\\vg\'')}\n`);
  });

  it('escapes \\f in string', () => {
    log.broadcast('Data', { some: 'str\fin\fg' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\fin\\fg\'')}\n`);
  });

  it('escapes \\0 in string', () => {
    log.broadcast('Data', { some: 'str\0in\0g' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\0in\\0g\'')}\n`);
  });

  it('escapes \\e in string', () => {
    log.broadcast('Data', { some: 'str\x1bin\x1bg' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\ein\\eg\'')}\n`);
  });

  it('prints umlaut in string', () => {
    log.broadcast('Data', { some: 'äüöÄÜÖ' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'äüöÄÜÖ\'')}\n`);
  });

  it('prints © and ® in string', () => {
    log.broadcast('Data', { some: '©®' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'©®\'')}\n`);
  });

  it('prints emoji', () => {
    log.broadcast('Data', { some: '🎉' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'🎉\'')}\n`);
  });

  it('escapes non-printable characters in string', () => {
    log.broadcast('Data', { some: '\x01str\x19in\x7fg' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=`
      + `${chalk.green('\'\\x01str\\x19in\\x7fg\'')}\n`);
  });

  it('escapes quote after mewline in string', () => {
    log.broadcast('Data', { some: 'str\nin\'g' });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.green('\'str\\nin\\\'g\'')}\n`);
  });

  it('highlights arrays', () => {
    log.broadcast('Data', { some: [1, 2] });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.magenta('[')}${chalk.yellow('1')}`
      + `${chalk.magenta(', ')}${chalk.yellow('2')}${chalk.magenta(']')}\n`);
  });

  it('highlights objects', () => {
    log.broadcast('Data', { some: { a: 7 } });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.magenta('{')} a${chalk.magenta(':')} `
      + `${chalk.yellow('7')} ${chalk.magenta('}')}\n`);
  });

  it('formats empty objects', () => {
    log.broadcast('Data', { some: {} });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('some')}=${chalk.magenta('{}')}\n`);
  });

  it('formats msg and date', () => {
    log.broadcast('Data', { date: new Date() });

    assert.equals(out, `${local_time} 📣 ${namespace} Data `
      + `${chalk.bold('date')}=`
      + `${chalk.yellow(date_time)}\n`);
  });

  it('formats just date', () => {
    log.broadcast({ date: new Date() });

    assert.equals(out, `${local_time} 📣 ${namespace} `
      + `${chalk.bold('date')}=`
      + `${chalk.yellow(date_time)}\n`);
  });

  function getFirstLineOfStack(error) {
    const p = error.stack.indexOf('\n');
    return error.stack.substring(0, p);
  }

  it('formats msg and error', () => {
    logger.pipe(new Formatter({ stack: 'message' })).pipe(stream);
    const error = new Error('Ouch!');

    log.error('Oups', error);

    const error_first_line = getFirstLineOfStack(error);
    assert.equals(out, `${local_time} 🚨 ${namespace} `
      + `Oups ${chalk.bgRed.white.bold(error_first_line)}\n`);
  });

  it('formats msg and error with cause', () => {
    logger.pipe(new Formatter({ stack: 'message' })).pipe(stream);
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.error('Oups', error);

    const error_first_line = getFirstLineOfStack(error);
    const cause_first_line = getFirstLineOfStack(cause);
    assert.equals(out, `${local_time} 🚨 ${namespace} `
      + `Oups ${chalk.bgRed.white.bold(error_first_line)}\n`
      + `  ${chalk.magenta('caused by')} `
      + `${chalk.bgRed.white.bold(cause_first_line)}\n`);
  });

  it('formats just error', () => {
    logger.pipe(new Formatter({ stack: 'message' })).pipe(stream);
    const error = new Error('Ouch!');

    log.error(error);

    const error_first_line = getFirstLineOfStack(error);
    assert.equals(out, `${local_time} 🚨 ${namespace} `
      + `${chalk.bgRed.white.bold(error_first_line)}\n`);
  });

  function getMessageAndFirstLineOfTrace(error) {
    const p1 = error.stack.indexOf('\n');
    const p2 = error.stack.indexOf('\n', p1 + 1);
    return {
      message: error.stack.substring(0, p1),
      trace: error.stack.substring(p1 + 1, p2).trim()
    };
  }

  it('formats error with first line of trace', () => {
    logger.pipe(new Formatter({ stack: 'peek' })).pipe(stream);
    const error = new Error('Ouch!');

    log.error(error);

    const e = getMessageAndFirstLineOfTrace(error);
    assert.equals(out, `${local_time} 🚨 ${namespace} `
      + `${chalk.bgRed.white.bold(e.message)} ${chalk.gray(e.trace)}\n`);
  });

  it('formats error and cause with first line of trace', () => {
    logger.pipe(new Formatter({ stack: 'peek' })).pipe(stream);
    const error = new Error('Ouch!');
    const cause = new Error('Cause');
    error.cause = cause;

    log.error(error);

    const e = getMessageAndFirstLineOfTrace(error);
    const c = getMessageAndFirstLineOfTrace(cause);
    assert.equals(out, `${local_time} 🚨 ${namespace} `
      + `${chalk.bgRed.white.bold(e.message)} ${chalk.gray(e.trace)}\n`
      + `  ${chalk.magenta('caused by')} `
      + `${chalk.bgRed.white.bold(c.message)} ${chalk.gray(c.trace)}\n`);
  });

  it('formats error with full trace', () => {
    logger.pipe(new Formatter({ stack: 'full' })).pipe(stream);
    const error = new Error('Ouch!');

    log.error(error);

    const error_first_line = getFirstLineOfStack(error);
    const lines = out.split('\n');
    assert.equals(lines[0], `${local_time} 🚨 `
      + `${namespace} ${chalk.bgRed.white.bold(error_first_line)}`);
    assert.equals(lines.length > 3, true);
    lines.slice(1).filter(line => line.trim()).forEach((line) => {
      refute.equals(line.indexOf(' at '), -1, line);
    });
  });

  describe('units', () => {

    beforeEach(() => {
      logger
        .pipe(new Formatter({ ts: false, ns: false, topic: false }))
        .pipe(stream);
    });

    it('highlights milliseconds', () => {
      log.numbers('=', { ms: 7 });

      assert.equals(out, `= ${chalk.yellow('7')}ms\n`);
    });

    it('highlights seconds', () => {
      log.numbers('=', { ms: 7000 });

      assert.equals(out, `= ${chalk.yellow('7.0')}s\n`);
    });

    it('highlights minutes', () => {
      log.numbers('=', { ms: 150000 });

      assert.equals(out, `= ${chalk.yellow('2.5')}m\n`);
    });

  });

  describe('options', () => {

    it('does not write timestamp if `ts` option is false', () => {
      logger.pipe(new Formatter({ ts: false })).pipe(stream);

      log.wtf('WTF?!');

      assert.equals(out, `👻 ${namespace} WTF?!\n`);
    });

    it('does not write emoji if `topic` option is false', () => {
      logger.pipe(new Formatter({ topic: false })).pipe(stream);

      log.wtf('WTF?!');

      assert.equals(out, `${local_time} ${namespace} WTF?!\n`);
    });

    it('does not write namespace if `ns` option is false', () => {
      logger.pipe(new Formatter({ ns: false })).pipe(stream);

      log.wtf('WTF?!');

      assert.equals(out, `${local_time} 👻 WTF?!\n`);
    });

    it('does not write data if `data` option is false', () => {
      logger.pipe(new Formatter({ data: false })).pipe(stream);

      log.numbers('Data', { bytes_foo: 42 });

      assert.equals(out, `${local_time} 🔢 ${namespace} Data\n`);
    });

    it('does not write stack if `stack` option is false', () => {
      logger.pipe(new Formatter({ stack: false })).pipe(stream);

      log.ignore('Err', new Error('Oh oh!'));

      assert.equals(out, `${local_time} 🙈 ${namespace} Err\n`);
    });

  });
});
