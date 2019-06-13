---
layout: layouts/post.njk
title: '001: The Start'
date: 2019-05-14T21:00:00.000Z
tags: journal
---
I’ve started this little journal because I’m going to start the process of both redesigning (well, properly designing) and re-platforming [Piccalilli](http://piccalil.li). I thought that I might as well keep a log of the process, so folks can learn and I can polish it up to show future clients how this sort of project might work out.

Posts will cover all sorts from prototypes, design system work, design discovery and build. This first post is going to cover an early discovery phase.

## What I’ve already got

For those that don’t already know what [Piccalilli](http://piccalil.li) is, let me take a moment to give you a summary.

Piccalilli is a newsletter about CSS that I publish every Friday morning. It contains links to fancy websites, animations, layouts and all sorts of other CSS content. I also try to publish an article every week about a CSS trick or utility that I use day-to-day. 

The newsletter is powered by [Curated](https://curated.co/) which has done a great job of getting this project off the ground. I turned the project from a [tweet](https://twitter.com/andybelldesign/status/1110900601788026880) into a proper newsletter in less than an evening, which is ace. The project has grown rapidly, though, and exposed some stuff that I don’t like about Curated:

* I can’t do anything with the design apart from change colours and select some limited fonts
* I can’t add alt text to images
* It tracks readers pretty heavily 
* Adding content is pretty damn clunky
* It doesn’t seem to support SSL, even on the signup page...

## What I want

The ideal project outcome would be: 

* A design for both web and email that I’m really happy with 
* A system where creating new issues is a pleasure 
* Much less (if any at all) tracking
* A fully accessible website
* A nicer signup process for new users
* Something that will allow me to expand the project how I want it to expand in the future

## Early thoughts on tech

I’m going to try and build this with the [JAMstack](https://jamstack.org/)—specifically [Eleventy](https://www.11ty.io/) and [Netlify](https://www.netlify.com/). I think that it’s doable with Lambda functions to do the heavy-lifting of the signup, unsubscribe and actual sending of emails. 

Some thoughts about services that could power this: 

* [Netlify CMS](https://www.netlifycms.org/) for creating and previewing issues
* [Mailgun](https://www.mailgun.com/) for sending emails (via a Lambda function)
* [MLab MongoDB](https://mlab.com/) for storing the mailing list 
* [Netlify functions](https://www.netlify.com/docs/functions/) for the Lambda functions

Some stuff that I need to investigate: 

* How I’m going to deal with media. The ideal situation is to be able to render images with [imgix](https://www.imgix.com/)
* How I’m going to migrate the current mailing list
* GDPR

## Wrapping up

This initial post is just me getting my early thoughts down. The next step is to first work out the media situation and then create an Eleventy site to test creating an issue. I’ll probably hook up Netlify CMS too. 

I’ll probably also start looking at designing a proper logo, or at least thinking about a proper logo. It’s currently an icon that I chucked together in about half an hour 🙈

If you want to follow along with this Journal, you can [subscribe to the RSS feed](/feed/feed.xml).

- - -

P.S. I used Netlify CMS to write this post and it was pretty darn good!
