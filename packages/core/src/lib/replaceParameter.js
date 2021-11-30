'use strict';

const logger = require('./log');

module.exports = function (template, prop, data) {
  let t = template;

  const valueRE = new RegExp(`{{{?\\s*[${prop}]+\\s*}?}}`);

  if (typeof data === 'string') {
    return t.replace(valueRE, data);
  }

  if (typeof data === 'boolean') {
    const startRE = new RegExp(`{{\\s*#[${prop}]+\\s*}}`);
    const endRE = new RegExp(`{{\\s*/[${prop}]+\\s*}}`);

    const bIdx = t.search(startRE);
    const eIdxStart = t.search(endRE);

    // try to determine if this is a {{#section}}
    // if it is, this looks like a boolean value meant to be a mere {{value}}
    if (bIdx === -1) {
      return t.replace(`{{${prop}}}`, data);
    }

    if (data) {
      t = t.replace(startRE, '');
      t = t.replace(endRE, '');
    } else {
      // data is falsey
      const eIdxEnd = t.indexOf('}}', eIdxStart) + 2;
      t = t.substring(0, bIdx) + t.substring(eIdxEnd, t.length);
    }
    return t;
  }

  logger.warning(`Could not replace ${prop} with ${data} inside ${template}`);
  return t;
};
