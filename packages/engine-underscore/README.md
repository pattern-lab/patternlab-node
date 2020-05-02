# The Underscore PatternEngine for Pattern Lab / Node

## Installing

To install the Underscore PatternEngine in your edition, `npm install @pattern-lab/engine-underscore` should do the trick.

## Supported features

* [x] [Includes](https://patternlab.io/docs/including-patterns/) (Accomplished using the included [`_.renderNamedPartial()`](https://github.com/pattern-lab/patternlab-node/blob/master/packages/engine-underscore/lib/engine_underscore.js#L54-L60))
* [x] Lineage
* [x] [Hidden Patterns](https://patternlab.io/docs/hiding-patterns-in-the-navigation/)
* [x] [Pseudo-Patterns](https://patternlab.io/docs/using-pseudo-patterns/)
* [x] [Pattern States](https://patternlab.io/docs/using-pattern-states/)
* [ ] [Pattern Parameters](https://patternlab.io/docs/using-pattern-parameters/) (Accomplished instead using parameter object passed to the included [`_.renderNamedPartial()`](https://github.com/pattern-lab/patternlab-node/blob/master/packages/engine-underscore/lib/engine_underscore.js#L54-L60) mixin function)
* [ ] [Style Modifiers](https://github.com/pattern-lab/patternlab-node/issues/1177) (Accomplished instead using parameter object passed to the included [`_.renderNamedPartial()`](https://github.com/pattern-lab/patternlab-node/blob/master/packages/engine-underscore/lib/engine_underscore.js#L54-L60) mixin function)

## Extensions to basic Underscore functionality

### Pattern including

Underscore templates include no native support for calling other templates, so support for pattern including is accomplished through an included Underscore mixin function, [`_.renderNamedPartial()`](https://github.com/pattern-lab/patternlab-node/blob/master/packages/engine-underscore/lib/engine_underscore.js#L54-L60), and is considered experimental, but seems to work just fine.

#### Example

```
<p>
  Here's a large button, with parameters:
  <%- _.renderNamedPartial('atoms-button', { variantClass: 'btn-large' }) %>
</p>
```

### Safely referring to deeply nested data in the pattern JSON

When referring to deeply nested data, it's helpful to have a way of doing that (as Handlebars and Mustache do) that's tolerant of unexpected `null` values. For example, if you have the following pattern JSON:

```json
{
  "foo": {
    "bar": {
      "value": "That is the question:"
    }
  }
}
```

And the following in an underscore template that refers to it:

```
<p>
  To be, or not to be, <%= foo.bar.value %>
</p>
```

If you feed that template JSON that (for whatever reason) has `foo.bar` as `null`, the pattern will crash because `null.value` throws an exception. It's nice to be able to write this instead:

```
<p>
  To be, or not to be, <%= _.getPath('foo.bar.value', obj) %>
</p>
```

and know that the output will be more safely "To be, or, not to be, null" instead of just throwing an error and crashing the pattern. This is mainly useful for operationalized pattern templates that will be provided with JSON from services that you can't control in Pattern Lab.

Note that `obj` is an Underscore pattern's current data context. See [Dr. Axel Rauschmeyer's article](http://www.2ality.com/2012/06/underscore-templates.html) for more.
