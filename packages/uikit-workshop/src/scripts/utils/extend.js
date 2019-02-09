export function extend(obj, props) {
  for (const i in props) {
    obj[i] = props[i];
  }
  return obj;
}
