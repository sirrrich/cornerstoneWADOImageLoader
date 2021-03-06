/**
 */
(function ($, cornerstone, cornerstoneWADOImageLoader) {

  "use strict";
  /**
   * Returns the first string value as a Javascript number
   *
   * @param element - The javascript object for the specified element in the metadata
   * @param [index] - the index of the value in a multi-valued element, default is 0
   * @param [defaultValue] - The default value to return if the element does not exist
   * @returns {*}
   */
  function getNumberString(element, index, defaultValue) {
    var value = cornerstoneWADOImageLoader.wadors.getValue(element, index, defaultValue);
    if(value === undefined) {
      return;
    }
    return parseFloat(value);
  }

  cornerstoneWADOImageLoader.wadors.getNumberString = getNumberString;
}($, cornerstone, cornerstoneWADOImageLoader));