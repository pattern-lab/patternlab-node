---
title: A post with code samples
date: '2019-06-18'
tags:
  - demo-content
  - code
  - blog
---
The best way to demo a code post is to display a real life post, so check out this one from [andy-bell.design](https://andy-bell.design/wrote/creating-a-full-bleed-css-utility/) about a full bleed CSS utility.

- - -

Sometimes you want to break your components out of the constraints that they find themselves in. A common situation where this occurs is when you don’t have much control of the container that it exists in, such as a CMS main content area.

This is even more the case with editing tools such as the [WordPress Gutenberg editor](https://wordpress.org/gutenberg/), where in theory, you could pull in a component from a design system and utilise it in the main content of your web page. In these situations, it can be pretty darn handy to have a little utility that makes the element 100% of the viewport’s width _and_ still maintain its flow within its parent container.

This is when I normally pull the `.full-bleed` utility class out of my back pocket.

## The `.full-bleed` utility

It’s small, but hella mighty:

```css
.full-bleed {
  width: 100vw;
  margin-left: 50%;
  transform: translateX(-50%);
}
```

Here it is in a context where it makes a fancy `<aside>` and a `<figure>` element bleed out of their parent container.

<iframe height="300" style="width: 100%;" scrolling="no" title="Piccalilli CSS Utility — Issue  #2 — Full bleed utility" src="//codepen.io/andybelldesign/embed/Nmxrwv/?height=300&theme-id=dark&default-tab=css,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/andybelldesign/pen/Nmxrwv/'>Piccalilli CSS Utility — Issue  #2 — Full bleed utility</a> by Andy Bell
  (<a href='https://codepen.io/andybelldesign'>@andybelldesign</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

The `.full-bleed` utility gives those elements prominence and _importantly_ keeps their semantic place in the page. Just how I like it.

- - -

🔥 **Pro tip**: When working with a utility like `.full-bleed`, it’s a good idea to add an inner container that has a max-width and auto horizontal margin. For this, I normal create a shared `.wrapper` component like this:

```css
.wrapper {
  max-width: 50rem;
  margin-left: auto;
  margin-right: auto;
}
```

Having a container like `.wrapper` helps to create consistent, centred content.  

- - -

### How the `.full-bleed` utility works

We set the container to be `width: 100vw`, which equates to the full viewport width. We couldn’t set it to `width: 100%` because it would only fill the space of its parent element. The parent element’s width _is_ useful though, because by setting `margin-left: 50%`, we are telling the component to align its **left edge** to the center of its parent element, because `50%` is half of the **parent element’s** width.

Finally, we use CSS transforms to `translateX(-50%)`. Because the transform works off the element’s dimensions and not the parent’s dimensions, it’ll pull the element back `50vw`, because it’s `100vw` wide, thus making it sit perfectly flush with the viewport’s edges.

## Wrapping up

Hopefully this short and sweet trick will help you out on your projects. If it does, [drop me a tweet](https://twitter.com/andybelldesign), because I’d love to see it!
