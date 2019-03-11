/*!
 * Data Saver
 */

import Cookies from 'js-cookie';
import deepmerge from 'deepmerge';

export const DataSaver = {
  // namespace all cookie names are prefixed with
  namespace: 'patternlab',

  /**
   * Add a given value to the cookie
   * @param  {String}       the name of the key
   * @param  {String}       the value
   */
  addValue(name, val) {
    const newData = {};
    newData[name] = val;

    let existingData = {};

    if (Cookies.getJSON(DataSaver.namespace)) {
      existingData = Cookies.getJSON(DataSaver.namespace);
    }

    const mergedData = deepmerge(existingData, newData);

    Cookies.set(DataSaver.namespace, mergedData, { expires: 7 });
  },

  /**
   * Update a value found in the cookie. If the key doesn't exist add the value
   * @param  {String}       the name of the key
   * @param  {String}       the value
   */
  updateValue(name, val) {
    DataSaver.addValue(name, val);
  },

  /**
   * Remove the given key
   * @param  {String}       the name of the key
   */
  removeValue(name) {
    const currentData = Cookies.getJSON(DataSaver.namespace);
    const updatedData = delete currentData[name];

    if (updatedData.keys()) {
      Cookies.set(DataSaver.namespace, updatedData, { expires: 7 });
    } else {
      Cookies.remove(DataSaver.namespace);
    }
  },

  /**
   * Find the value using the given key
   * @param  {String}       the name of the key
   * @return {String}       the value of the key or false if the value isn't found
   */
  findValue(name) {
    const existingData = Cookies.getJSON(DataSaver.namespace);

    if (existingData !== undefined) {
      if (existingData[name] !== undefined) {
        return existingData[name];
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
};
