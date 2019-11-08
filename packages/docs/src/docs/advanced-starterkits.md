---

title: Starterkits | Pattern Lab
heading: Starterkits
---

{% capture m %}

Starterkits are a potent way create or augment a Pattern Lab instance with a baseline set of patterns and assets. They are an important part of the [Pattern Lab Ecosystem](/docs/advanced-ecosystem-overview.html) An agency or team could use it for each new client or project. [Several starterkits](https://github.com/pattern-lab?utf8=%E2%9C%93&q=starterkit&type=&language=) already exist to kick your project off, whether you’re looking for a blank start, begin with a demo that showcases Pattern Lab’s features, or start with a popular framework like Bootstrap, Foundation, or Material Design.

## Structure

A Starterkit's structure mirrors that of the default file structure of Pattern Lab. Usually this is found under the `dist/` directory:

```
_annotations/
_data/
_meta/
_patterns/
css/
fonts/
images/
js/
favicon.ico
```

Teams constructing their own Starterkits should stick to this structure if they wish to publish it externally, else may alter the structure to their [configured `paths`](/docs/advanced-config-options.html#node).

## Installing Starterkits

Open your terminal and navigate to the root of your project. Type:

```
npm install [starterkit-name]
gulp patternlab:loadstarterkit --kit=[starterkit-name]
```

where [starterkit-name] is the name of the Starterkit.

so... a complete example:

```
npm install @pattern-lab/starterkit-mustache-demo
gulp patternlab:loadstarterkit --kit=@pattern-lab/starterkit-mustache-demo
```

The [Pattern Lab Node CLI](https://github.com/pattern-lab/patternlab-node/tree/master/packages/cli) will also support installation of Starterkits should you not be using gulp.

## PSA

**LOADING A STARTERKIT WILL OVERWRITE ANY MATCHES INSIDE `./source`** Users can pass another flag `--clean=true` to attempt to delete the contents of `./source` prior to load.

* Sometimes users will run into file permissions issues. It's recommended to run all command prompts as administrator if you can.

`patternlab-config.json` also defines a `starterkitSubDir` key (with a default value of `dist`) which can be used to target a directory inside the starterkit module if need be.

<strong>The PHP version of Pattern Lab is being deprecated in favor of a new unified Pattern Lab core. <a href='./php/advanced-starterkits'>The PHP docs for this topic can be viewed here.</a></strong>

{% endcapture %}
{{ m | markdownify }}
