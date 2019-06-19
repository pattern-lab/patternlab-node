# A simple starter kit for Eleventy

Hylia is a lightweight [Eleventy](https://11ty.io) starter kit with [Netlify CMS](https://www.netlifycms.org/) pre-configured, so that you can one-click install a progressive, accessible blog in minutes. It also gives you a well organised starting point to extend yourself.

Get started now by **[deploying Hylia to Netlify.](https://app.netlify.com/start/deploy?repository=https://github.com/andybelldesign/hylia)**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/andybelldesign/hylia)


<img src="https://hankchizljaw.imgix.net/hylia-github.jpg?auto=format&q=60" width="35rem" />

## Features

Hylia version 0.1.0 features:

✍️ A pre-configured [Netlify CMS](https://www.netlifycms.org/) setup  
🎨 Customisable design tokens to make it your own  
🌍 Customisable global data and navigation  
📂 Tags and tag archives  
✅ Progressively enhanced, semantic and accessible    
🎈 _Super_ lightweight front-end   
🚰 Sass powered CSS system with utility class generator  
⚙️ Service worker that caches pages so people can read your articles offline

## Roadmap 

💬 [Netlify Forms](https://www.netlify.com/docs/form-handling/) powered comments  
💡 Dark/Light mode toggle  
🗣 Webmentions  
📖 Pagination  
🐦 Web sharing API integration  
🗒 Offline mode with links to cached pages
📄 Documentation site
💅 Sass documentation
✍️ CMS documentation

***

## Getting started

### Method one: One-Click Deploy to Netlify

You can [deploy Hylia to Netlify with one click](https://app.netlify.com/start/deploy?repository=https://github.com/andybelldesign/hylia) and you’ll be up and running!

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/andybelldesign/hylia)


### Method two: Clone / Fork

1. Clone or fork this repo: `git clone https://github.com/andybelldesign/hylia`
2. `cd` into the project directory and run `npm install`
3. Once all the dependencies are installed run `npm start`
4. Open your browser at `http://localhost:8080` and away you go! 

## Terminal commands 

### Serve the site locally 

```bash
npm start
```

### Build a production version of the site

```bash
npm run production
```

### Compile Sass 

```bash
npm run sass:process
```

### Re-generate design tokens for Sass

```bash
npm run sass:tokens
```

## Docs

### Design Tokens and Styleguide 

#### Design Tokens

Although Hylia has a pretty simple design, you can configure the core design tokens that control the colours, size ratio and fonts. 

*** 

⚠️ Note: In the CMS you can only control the size ratio and colours.

***

To change the design tokens in the CMS, find the “Globals” in the sidebar then in the presented options, select “Theme Settings”. 

To change the design tokens directly, edit [`_src/data/tokens.json`](https://github.com/andybelldesign/hylia/blob/master/src/_data/tokens.json). 

The tokens are converted into maps that the Sass uses to compile the front-end CSS, so make sure that you maintain the correct structure of `tokens.json`.

#### Styleguide

Your version of Hylia ships with a Styleguide by default. You can see a demo of the Styleguide at <https://hylia.website/styleguide/>.

You can edit the Styleguide by opening [`src/styleguide.njk`](https://github.com/andybelldesign/hylia/blob/master/src/styleguide.njk). If you don’t want the Styleguide, delete that file and the page will vanish.

### CMS

Hylia has [Netlify CMS](https://www.netlifycms.org/) pre-configured as standard. You can customise the configuration by editing [`src/admin/config.yml`](https://github.com/andybelldesign/hylia/blob/master/src/admin/config.yml).

#### Content that you can edit

The basic CMS setup allows you to edit the following:

- **Home page**: Edit the content on your homepage
- **Posts**: Create and edit blog posts
- **Generic pages**: Create generic pages that use a similar layout to posts
- **Global site data**: Various bits of global site data such as your url, title, posts per page and author details
- **Navigation**: Edit your primary navigation items
- **Theme**: Edit the design tokens that power the site’s theme

## Get involved 

This project is _super_ early and feedback is very much welcome. In order to keep things running smooth, please consult the [contribution guide and code of conduct](https://github.com/andybelldesign/hylia/blob/master/contributing.md).

The stuff that I need the most help with is:

- Documentation
- Webmentions 
- Performance


