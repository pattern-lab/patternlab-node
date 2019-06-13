---
layout: layouts/post.njk
title: '002: The Media Conundrum'
date: 2019-05-15T21:57:32.988Z
tags: journal
---
Something that is imperative to get working before I embark on using the [JAMstack](https://jamstack.org/) to build the new [Piccalilli](http://piccalil.li/) system is _media_—specifically images. The newsletter features images for almost every link that I share, so I need to be able to:

* Serve optimised images
* Utilise modern responsive image techniques
* Be able to upload images both with Netlify CMS and “manually” without much fuss

I thought that an AWS S3 bucket setup with [imgix](https://www.imgix.com/) serving the images would be ideal, so I sent out [a tweet](https://twitter.com/andybelldesign/status/1128671364334981120) looking for advice. Good ol’ [Phil](https://twitter.com/philhawksworth) pointed me in the direction of [Netlify Large Media](https://www.netlify.com/products/large-media/) and holy heck, it seemed absolutely perfect. 

But then, trying to implement that setup was pretty grim. I really struggled and couldn’t get it to work with the CMS _at all._ After a load of searching around, I kept seeing [Uploadcare](https://uploadcare.com) being mentioned. I checked it out, followed the guide and boom: images working via a CDN like a charm! Here’s my cat to celebrate, using their transforms.

![My cat, sat on my lap](https://res.cloudinary.com/andybelldesign/image/upload/c_scale,f_auto,q_auto,w_1000/v1557995438/IMG_0440_kqonri.jpg "My cat, sat on my lap")

This could be the winning setup for this project. Let’s see how it holds up with some light prototyping of a newsletter issue.

- - -

**Update**: I just switched up to use [Cloudinary](https://cloudinary.com/) instead and it is _much_ better. Also, my pal [Eric](https://twitter.com/etportis) is the Web Platform Advocate there, so you know that they're good people. I’m also very interested in the video processing stuff that they do.
