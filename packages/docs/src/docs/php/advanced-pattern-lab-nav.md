---

title: Modifying Pattern Lab's Navigation | Pattern Lab
heading: Modifying Pattern Lab's Navigation - PHP
---

When sharing Pattern Lab with a client it may be beneficial to turn-off certain elements in the default navigation. To turn-off navigation elements do the following:

1. Open `./config/config.yml`
2. Add the keys for the elements you'd like to hide to the `ishControlsHide` configuration option
3. Re-generate your Pattern Lab site

The following keys are supported and will hide their respective elements:

```
s
m
l
full
random
disco
hay
find
views-new
tools-all
tools-docs
```

`hay` is disabled by default.
