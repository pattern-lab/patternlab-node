"use strict";

const logger = require('./log');

module.exports = function (template, prop, data) {
  let t = template;

  if (typeof data === 'string') {
    return t.replace(`{{${prop}}}`, data);
  }

  if (typeof data === 'boolean') {
    const startRE = new RegExp(`{{\\s?#[${prop}]+\\s?}}`);
    const endRE = new RegExp(`{{\\s?/[${prop}]+\\s?}}`);
    if (data) {
      t = t.replace(startRE, '');
      t = t.replace(endRE, '');
    } else {
      const bIdx = t.search(startRE);
      const eIdxStart = t.search(endRE);
      const eIdxEnd = t.indexOf('}}', eIdxStart) + 2;
      t = t.substring(0, bIdx) + t.substring(eIdxEnd, t.length);
    }
    return t;
  }

  console.log(`Could not replace ${prop} with ${data} inside ${template}`);
  logger.warning(`Could not replace ${prop} with ${data} inside ${template}`);
  return t;
};
