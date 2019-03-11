// Utility function used for outputting correctly formatted CSS classes in JSX.
// Ported over from https://github.com/wc-catalogue/blaze-elements/blob/master/packages/common/css.ts

export function css(...args) {
  const classes = [];

  for (const arg of args) {
    if (arg) {
      if (typeof arg === 'string') {
        classes.push(arg);
      } else {
        for (const key in arg) {
          if (arg[key]) {
            classes.push(key);
          }
        }
      }
    }
  }

  return classes.join(' ');
}
