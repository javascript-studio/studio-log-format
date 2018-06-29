/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

function two(n) {
  return n < 10 ? `0${n}` : n;
}

function three(n) {
  return n < 100 ? `0${two(n)}` : n;
}

module.exports = function (date) {
  return `${two(date.getHours())}:${two(date.getMinutes())}:`
    + `${two(date.getSeconds())}.${three(date.getMilliseconds())}`;
};
