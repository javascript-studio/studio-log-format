/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const Transform = require('stream').Transform;
const topics = require('@studio/log-topics');
const valueFormat = require('./lib/value-format');

function formatStack(style, stack) {
  if (style === true || style === 'full') {
    return stack;
  }
  const p1 = stack.indexOf('\n');
  const first_line = p1 === -1 ? stack : stack.substring(0, p1);
  if (style === 'message' || p1 === -1) {
    return first_line;
  }
  const p2 = stack.indexOf('\n', p1 + 1);
  const peek = p2 === -1
    ? stack.substring(p1 + 1)
    : stack.substring(p1 + 1, p2);
  return `${first_line} ${peek.trim()}`;
}

module.exports = class extends Transform {

  constructor(opts) {
    super({
      writableObjectMode: true
    });
    opts = opts || {};
    this.ts = opts.ts !== false;
    this.topic = opts.topic !== false;
    this.ns = opts.ns !== false;
    this.data = opts.data !== false;
    this.stack = opts.hasOwnProperty('stack') ? opts.stack : 'peek';
  }

  _transform(entry, enc, callback) {
    const parts = [];
    if (this.ts) {
      parts.push(new Date(entry.ts).toISOString());
    }
    if (this.topic) {
      parts.push(topics[entry.topic]);
    }
    if (this.ns) {
      parts.push(`[${entry.ns}]`);
    }
    if (entry.msg) {
      parts.push(entry.msg);
    }
    if (this.data && entry.data) {
      if (typeof entry.data === 'object') {
        for (const key in entry.data) {
          if (entry.data.hasOwnProperty(key)) {
            const value = entry.data[key];
            const kvu = valueFormat(key, value, JSON.stringify);
            const k = kvu[0];
            const v = kvu[1];
            const unit = kvu[2];
            parts.push(k ? `${k}=${v}${unit}` : `${v}${unit}`);
          }
        }
      } else {
        parts.push(JSON.stringify(entry.data));
      }
    }
    if (this.stack && entry.stack) {
      parts.push(formatStack(this.stack, entry.stack));
    }
    let str = parts.join(' ');
    if (this.stack && entry.cause) {
      str += `\n  caused by ${formatStack(this.stack, entry.cause)}`;
    }
    callback(null, `${str}\n`);
  }

};
