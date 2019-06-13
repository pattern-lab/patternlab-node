---
layout: layouts/post.njk
title: '004: CMS, content and contexts'
date: 2019-05-18T10:15:26.186Z
tags: journal
---
Before I get in to the fun part: design, I wanted to test out how managing the content of an issue might work with some light prototyping with [Netlify CMS](https://www.netlifycms.org/) and [Eleventy](//11ty.io). I first thought to myself “This is easy—the issues can _just_ be like blog posts”, which is absolutely right, but, in danger of using a term that makes me want to be sick in my mouth: it doesn’t “scale”. 

In the future, I want folks to be able to find items that appeared in previous issues, so if all of the content per issue is in markdown, it’ll make that job very difficult for me. Luckily, Netlify CMS has a [list widget](https://www.netlifycms.org/docs/widgets/#list) which allows you to nest other lists. This gives you some pretty sweet structured content, which means I can add tags per item! 

![My text editor showing the admin config of nest list widgets ](https://res.cloudinary.com/andybelldesign/image/upload/c_scale,f_auto,q_auto,w_1000/v1558175014/piccalilli%20journal/Screenshot_2019-05-18_at_11.15.22_thwf1o.jpg)

The admin interface for this is pretty decent, too. I can also quite easily manage the content in the markdown file, manually because it’s all front-matter based. Already it’s 100% easier than managing content with [Curated](https://curated.co/). Happy days. 

This flexible content system and CMS interface very much reminds me of [Kirby CMS](https://getkirby.com/), which I’ve had a lot of good experience with. Having loads of flexibility with content, while also benefiting from the speed of a static site feels like a real winning situation.

![Admin interface shows structured content which is easily editable](https://res.cloudinary.com/andybelldesign/image/upload/c_scale,f_auto,q_auto,w_1000/v1558175014/piccalilli%20journal/Screenshot_2019-05-18_at_11.19.39_hg6pz2.jpg)

It’s important that I get this content setup right because managing content needs to be very easy, and having flexible content will give me more freedom to provide handy features for subscribers in the future. I think I’ve managed to tick all the boxes with the early work here.

## Contexts

There are 3 main contexts for Piccalilli:

* Email
* Web
* RSS

Because of these very different contexts, I need to handle things a bit differently with [Eleventy](//11ty.io). I’ve used [environment variables](https://www.11ty.io/docs/data-js/#example%3A-exposing-environment-variables) to determine wether I’m in a **web** or **email** context. This has allowed me to conditionally render certain stuff depending on where I am. 

This will be really useful when I’m sending issues to people because in the email context, I can provide unsubscribe links and links to the web version. In the web context I can provide a signup form and links to the archive along with a modern CSS powered UI. 

![The basic feed of issues in the web context. ](https://res.cloudinary.com/andybelldesign/image/upload/c_scale,f_auto,q_auto,w_1000/v1558175014/piccalilli%20journal/Screenshot_2019-05-18_at_10.48.29_kjqc4g.jpg)

![The email context shown with just a title because the web content hasn't been rendered.](https://res.cloudinary.com/andybelldesign/image/upload/c_scale,f_auto,q_auto,w_1000/v1558175014/piccalilli%20journal/Screenshot_2019-05-18_at_10.48.34_wnklze.jpg)

One thing I absolutely don’t want to do is have separate codebases and I also want the content to be shared between **all** contexts, so this setup seems to be ideal. 

In terms of markup: I should be able to share that between all contexts and use CSS to deal with the differences in UI. Good ol’ [progressive enhancement](https://andy-bell.design/wrote/the-power-of-progressive-enhancement/) will be stepping in to make this process a doddle, too.

## Basic front-end of issues in place

The last thing I’ve done before I move on to more design stuff is throw together some basic front-end markup for the issues. Well, the main content of an issue anyway. 

I wanted to test the viability of the front-matter powered content and I’ve got to say, it was a dream to work with, thanks to Eleventy and [Nunjucks](https://mozilla.github.io/nunjucks/). Creating a version of what I’ve already got with Curated took only a few minutes. Because the content is structured, I can now start to really improve how the markup works and also give myself a bit of design flexibility.

![The latest issue (issue 8) being rendered in the web context](https://res.cloudinary.com/andybelldesign/image/upload/c_scale,f_auto,q_auto,w_1000/v1558175014/piccalilli%20journal/Screenshot_2019-05-18_at_11.14.04_bshdrf.jpg)

- - -

Now it’s time for me to start doing one of my favourite parts of a project: design discovery 🎉
