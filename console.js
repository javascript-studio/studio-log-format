/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const Writable = require('stream').Writable;
const topics = require('@studio/log-topics');
const time = require('./lib/time');

function defined(value) {
  return value !== undefined;
}

module.exports = class extends Writable {

  constructor(opts) {
    super({
      objectMode: true
    });
    opts = opts || {};
    this.trim = opts.hasOwnProperty('trim') ? opts.trim : true;
    this.log = opts.log || console.log;
  }

  _write(entry, enc, callback) {
    let topic = topics[entry.topic];
    if (this.trim) {
      topic = topic.trim();
    }
    const parts = [entry.msg, entry.data, entry.stack, entry.cause]
      .filter(defined);
    this.log(`${time(new Date(entry.ts))} ${topic} ${entry.ns}`, ...parts);
    callback();
  }

};
