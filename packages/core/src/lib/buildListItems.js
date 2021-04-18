'use strict';

let _ = require('lodash'); //eslint-disable-line prefer-const

const items = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];

module.exports = function (container) {
  //combine all list items into one structure
  const list = [];
  for (const item in container.listitems) {
    if (container.listitems.hasOwnProperty(item)) {
      list.push(container.listitems[item]);
    }
  }
  const listItemArray = _.shuffle(list);

  for (let i = 1; i <= listItemArray.length; i++) {
    const tempItems = [];
    if (i === 1) {
      tempItems.push(listItemArray[0]);
      container.listitems['listItems-' + items[i]] = tempItems;
      delete container.listitems[i];
    } else {
      for (let c = 1; c <= i; c++) {
        tempItems.push(listItemArray[c - 1]);
        container.listitems['listItems-' + items[i]] = tempItems;
        delete container.listitems[i];
      }
    }
  }
};
