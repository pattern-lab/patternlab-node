---

title: Adding New Patterns | Pattern Lab
heading: Adding New Patterns
---

To add new patterns to the PHP and Node versions of Pattern Lab just add new Mustache templates under the appropriate pattern type or pattern subtype directories in `./source/_patterns`. For example, let's add a new pattern under the pattern type "molecules" and the pattern sub-type "blocks". The `./source/_patterns/molecules/blocks/` directory looks like:

    block-hero.mustache
    headline-byline.mustache
    media-block.mustache

If we want to add a new pattern we simply tack it onto the end:

    block-hero.mustache
    headline-byline.mustache
    media-block.mustache
    new-pattern.mustache

If you want more control over their ordering please refer to "[Reorganizing Patterns](/docs/pattern-reorganizing.html)."
