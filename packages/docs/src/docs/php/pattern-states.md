---

title: Using Pattern States | Pattern Lab
heading: Using Pattern States - PHP
---

{% capture m %}

Pattern states provide your team and client a simple visual of the current state of patterns in Pattern Lab. Pattern states can track progress of a pattern from development, through client review, to completion or they can be used to give certain patterns specific classes. It's important to note that the state of a pattern can be influenced by its pattern partials.

## The Default Pattern States

Pattern Lab comes with the following default pattern states:

* **inprogress**: pattern is in development or being worked upon. a red dot.
* **inreview**: pattern is ready for a client to look at and comment upon. a yellow dot.
* **complete**: pattern is ready to be moved to production. a green dot.

Any pattern that includes a pattern partial that has a lower pattern state will inherit that state. For example, a pattern with the state of `inreview` that includes a pattern partial with the state of `inprogress` will have its state overridden and set to `inprogress`. It will not change to `inreview` until the pattern partial has a state of `inreview` or `complete`.

## Giving Patterns a State

Giving patterns a state is simply a matter of modifying the file name. If we wanted to give our `molecules-media-block` pattern a state of `inprogress` we'd change the file name from:

```
./source/_patterns/01-molecules/02-blocks/00-media-block.mustache
```

to:

```
./source/_patterns/01-molecules/02-blocks/00-media-block@inprogress.mustache
```

## Adding Customized States

The three default states included with Pattern Lab might not be enough for everyone. To add customized states you should modify your own CSS files. **DO NOT** modify `states.css` in `public/styleguide/css/`. This is because `states.css` will be overwritten in future upgrades.

You can use the following as your CSS template for new pattern states:

```css
{% raw %}.newpatternstate:before {
    color: #B10DC9 !important;
}{% endraw %}
```

Then add `@newpatternstate` to your patterns to have the new look show up. If you want to add it to the cascade of the default patterns you can modify `./config/config.yml`. Simply add your new pattern state to the `patternStates` list.

{% endcapture %}
{{ m | markdownify }}
