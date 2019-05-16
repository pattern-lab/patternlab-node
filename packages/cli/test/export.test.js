const exportPatterns = require('../bin/cli-actions/export');
const tap = require('tap');
const wrapAsync = require('../bin/utils').wrapAsync;

tap.test('Export ->', t => {
  t.plan(2);
  t.test('with options empty', tt =>
    wrapAsync(function*() {
      try {
        yield exportPatterns();
      } catch (err) {
        tt.type(err, TypeError, 'throws when options are empty');
        tt.end();
      }
    })
  );
  t.test('with options not an object', tt =>
    wrapAsync(function*() {
      try {
        yield exportPatterns(123);
      } catch (err) {
        tt.type(
          err,
          TypeError,
          'throws when passed options are not of type object'
        );
        tt.end();
      }
    })
  );
});
