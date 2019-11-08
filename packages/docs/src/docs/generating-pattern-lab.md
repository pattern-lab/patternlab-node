---

title: Generating Pattern Lab | Pattern Lab
heading: Generating Pattern Lab
---

{% capture m %}

Running Pattern Lab for the first time will vary depending on which version was [installed](/docs/installation.html). 

## edition-node
If you installed [edition-node](https://github.com/pattern-lab/edition-node), run the following command to serve Pattern Lab and watch for changes:

```
npm run pl:serve
```

## edition-twig
If you installed [edition-twig](https://github.com/pattern-lab/edition-php-twig-standard), run the following command to serve Pattern Lab and watch for changes:

```
php core/console --watch
```


## edition-node-gulp (legacy)
If you installed Pattern Lab [edition-node-gulp](https://github.com/pattern-lab/edition-node-gulp), run the following command to serve Pattern Lab and watch for changes:

```
gulp patternlab:serve
```

## Pattern Lab is now running: now what?
Your Pattern Lab should now be populated and [available for viewing](/docs/viewing-patterns.html#node) and you can [make changes to your patterns](/docs/editing-source-files.html).

<strong>The PHP version of Pattern Lab is being deprecated in favor of a new unified Pattern Lab core. <a href='./php/generating-pattern-lab'>The PHP docs for this topic can be viewed here.</a></strong>

{% endcapture %}
{{ m | markdownify }}
