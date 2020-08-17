/**
 * Does the origin sending the message match the current host?
 * if not dev/null the request
 *
 * @param {MessageEvent} event A message received by a target object.
 */
export function iframeMsgDataExtraction(event) {
  if (
    window.location.protocol !== 'file:' &&
    event.origin !== window.location.protocol + '//' + window.location.host
  ) {
    return {};
  }

  try {
    return typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
  } catch (e) {
    // @todo: how do we want to handle exceptions here?
    return {};
  }
}
