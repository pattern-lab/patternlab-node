---
layout: layouts/post.njk
title: 008 - Thinking about flows
date: 2019-06-08T08:32:45.568Z
tags: [journal, 'another tag', lipsum]
---

During a little break from this project, I’ve hired the incredibly talented [Jina Anne](http://twitter.com/jina) to work on the new Piccalilli branding for me, so I’m going to focus on one design aspect that I enjoy a lot: user experience.

## Flows

A key part of this project is making sure that I think about how both the user flow and the system flow cross each other. I find tools like [whimsical](https://whimsical.com) really handy for mapping that sort of thinking out. The flows for Piccalilli are pretty straightforward. A user can subscribe or unsubscribe to issues and that’s about it, but it’s still worth having a think about.

When I make some wireframe/prototypes, I might think about some handy ways users can manage their display preferences and grab a link to the RSS feed (native clipboard API for the win), but generally, I just need to work out where to send the user and their email at various points.

## Making flow charts

You can see the work in progress as I do it [here](https://whimsical.com/Fwki9UwDpn4mZfFVUeXo4P).

I sew the user flow and the system flow together. I use light blocks for users and dark blocks for system. The users and system are mostly independent of each other, which is important as I’ll be doing system processing with with a little Node API, so passing users around with that will be suboptimal, albeit necessary in some contexts.

I say necessary because this project is progressively enhanced where possible and an important part of that is thinking about the [minimum viable experience](https://andy-bell.design/wrote/the-power-of-progressive-enhancement/). The minimum viable experience for an email signup is a HTTP post, via a `<form>`, straight to the API and then redirecting the user back to a status page. An enhanced experience would probably feature some sort of JavaScript based posting with an inline status while keeping the user on the site. There’s probably less interfering with their history with that approach.

The important thing is that it should be simple and user-friendly _regardless_ of what technology is supported at that given moment. Good ol’ progressive enhancement.

---

Next up, I’m going to fire up a copy of [Eleventy](//11ty.io) and start creating HTML, CSS and JavaScript wireframe/prototypes.
