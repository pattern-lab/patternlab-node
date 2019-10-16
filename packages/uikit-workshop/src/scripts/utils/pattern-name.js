import { urlHandler } from '../utils';

let patternName = '';

if (window.config) {
  patternName =
    window.config.defaultPattern !== undefined &&
    typeof window.config.defaultPattern === 'string' &&
    window.config.defaultPattern.trim().length > 0
      ? window.config.defaultPattern
      : 'all';

  // get the request vars
  const oGetVars = urlHandler.getRequestVars();

  if (oGetVars.p !== undefined || oGetVars.pattern !== undefined) {
    patternName = oGetVars.p !== undefined ? oGetVars.p : oGetVars.pattern;
  }
}

export { patternName };
