---
title: Creating Lists with Pattern Lab's Default `listItems` Variable
tags:
  - docs
category: data
---

Many more complicated patterns may include lists of objects. For example, comments or headlines. The PHP and Node versions of Pattern Lab come with a simple way to fill out these lists with dynamic data so that you can quickly stub them out. The list data can be found in `./source/_data/listitems.json` and is accessed in patterns using the `listItems` key. Lists are randomized each time the Pattern Lab website is generated.

## Using listItems Attributes to Create a Simple List

Let's look at a simple example of iterating over a list. In your template you might have:

```html
{% raw %}
<ul>
  {{# listItems.four }}
  <li>{{ title }}</li>
  {{/ listItems.four }}
</ul>
{% endraw %}
```

Let's break this down before showing the results. The `#` denotes that Mustache needs to loop over the given key that contains multiple values, in this case `listItems.four`, and write-out the corresponding value `{% raw %}{{ title }}{% endraw %}`. A full list of attributes can be found below. The `/` denotes the end of the block that's being rendered. The PHP and Node versions of Pattern Lab support the keys `one` through `twelve`. If you need more than twelve items for a given list you'll need to add your own data. **Important**: the keys `one` through `twelve` are Pattern Lab-specific and not a general feature of Mustache.

The above would compile to:

```html
<ul>
  <li>Rebel Mission to Ord Mantell</li>
  <li>Help, help, I'm being repressed!</li>
  <li>Bacon ipsum dolor sit amet turducken strip steak beef ribs shank</li>
  <li>Nullizzle shizznit velizzle, hizzle, suscipit own yo', gravida vizzle, arcu.</li>
</ul>
```

If you wanted six items in your list you'd write:

```html
{% raw %}
<ul>
  {{# listItems.six }}
  <li>{{ title }}</li>
  {{/ listItems.six }}
</ul>
{% endraw %}
```

## Combining listItems with Includes

Let's look at how we might build a comment thread using `listItems` and includes. First we'll start with an organism called `comment-thread` that looks like:

```html
<section class="comments section">
  <div class="comments-container" id="comments-container">
    <h2 class="section-title">Comment List</h2>
    <div class="comment-list">
      {% raw %}{{# listItems.five }} {{> molecules-single-comment }} {{/ listItems.five
      }}{% endraw %}
    </div>
  </div>
</section>
```

This organism is including the `single-comment` molecule ( `{% raw %}{{> molecules-single-comment}}{% endraw %}` ) _within_ our block where we're iterating over five items from the `listItems` variable ( `{% raw %}{{# listItems.five }}{% endraw %}` ). What this is doing is rendering the `single-comment` molecule five times with different data each time. Our `single-comment` molecule might look like this:

```html
{% raw %}
<div class="comment-container">
  <div class="comment-meta">
    {{> atoms-avatar }}
    <h4 class="comment-name"><a href="{{ url }}">{{ name.first }} {{ name.last }}</a></h4>
  </div>
  <div class="comment-text">
    <p>{{ description }}</p>
  </div>
</div>
{% endraw %}
```

Note how the Mustache variable names match up to the attributes available in our `listItems` variable. Again, each time the `single-comment` pattern is rendered those variables will have different data. Using a partial allows us to DRY up our code. We can even nest partials within partials as shown by `{% raw %}{{> atoms-avatar }}{% endraw %}` in our example.

**Important**: You don't have to use the default `listItems` variable to take advantage of this feature. You can also use this method with pattern-specific data files or the default `data.json` file.

## Overriding the Defaults with Pattern-specific listItems

In much the [same way that one can override values](/docs/data-pattern-specific.html) in `_data.json` with pattern-specific data you can also override `_listitems.json`. The same principles apply but it's a slightly different naming convention. For example, if you wanted to provide pattern-specific `listItem` data for the `article` pattern under the pattern type `pages` your `pages` directory would look like this:

```
pages/article.mustache
pages/article.listitems.json
```

Otherwise [the same rules for overriding defaults](/docs/data-pattern-specific.html) for `_data.json` apply to `_listitems.json`.

## The listItems Attributes

The list text attributes were built using several lorem ipsum generators. The image attributes utilize [placeimg.com](http://placeimg.com). The names were generated with [Behind the Name](http://www.behindthename.com/). The available attributes are:

```
title
description
url
headline.short         (~37 characters long)
headline.medium        (~72 characters long)
excerpt.short          (~150 characters long)
excerpt.medium         (~233 characters long)
excerpt.long           (~450 characters long)
img.avatar.src
img.avatar.alt
img.square.src
img.square.alt
img.rectangle.src      (4x3 aspect ratio)
img.rectangle.alt
img.landscape-4x3.src
img.landscape-4x3.src
img.landscape-16x9.src
img.landscape-16x9.alt
name.first             (e.g. Junius)
name.firsti            (e.g. J)
name.middle            (e.g. Marius)
name.middlei           (e.g. M)
name.last              (e.g. Koolen)
name.lasti             (e.g. K)
year.long              (e.g. 2013)
year.short             (e.g. 13)
month.long             (e.g. January)
month.short            (e.g. Jan)
month.digit            (e.g. 01)
dayofweek.long         (e.g. Monday)
dayofweek.short        (e.g. Mon)
day.long               (e.g. 05)
day.short              (e.g. 5)
day.ordinal            (e.g. th)
hour.long              (e.g. 11)
hour.short             (e.g. 11)
hour.military          (e.g. 23)
hour.ampm              (e.g. pm)
minute.long            (e.g. 09)
minute.short           (e.g. 9)
seconds                (e.g. 52)
```

The aspect ratio for `img.rectangle` is 4x3. Hopefully this gives pattern developers an easy way to build out dynamic lists for testing.
