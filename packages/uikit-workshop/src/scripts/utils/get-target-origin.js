export const targetOrigin =
  window.location.protocol === 'file:'
    ? '*'
    : window.location.protocol + '//' + window.location.host;
