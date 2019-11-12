---
title: Converting Old Patterns
tags:
  - docs
category: patterns
---

You may have invested time in building patterns for Brad's original edition of Pattern Lab but now want to convert them so they can be used with the new PHP version of Pattern Lab. To convert them all you need to do is swap out the old `inc()` calls for the Mustache-based [shorthand partials syntax](/docs/pattern-including.html). For example, let's say this was a call to a pattern using the original syntax:

    <?php inc('atom','logo') ?>

The new Mustache-based shorthand partials syntax would be:

    {% raw %}{{> atoms-logo }}{% endraw %}

The only real difference between the two is that the pattern type, e.g. `atoms`, has to be exact when using the Mustache partials syntax. Otherwise, it should be very easy to convert between the two formats.
