![license](https://img.shields.io/github/license/pattern-lab/styleguidekit-assets-default.svg)
[![Packagist](https://img.shields.io/packagist/v/pattern-lab/styleguidekit-assets-default.svg)](https://packagist.org/packages/pattern-lab/styleguidekit-assets-default) [![Gitter](https://img.shields.io/gitter/room/pattern-lab/frontend-viewer.svg)](https://gitter.im/pattern-lab/frontend-viewer)

# Static Assets for the Default StyleguideKit

These static assets are meant to be used with the default [Mustache](https://github.com/pattern-lab/styleguidekit-mustache-default) and [Twig](https://github.com/pattern-lab/styleguidekit-twig-default) StyleguideKits. They control the look, feel, and functionality of the front-end of Pattern Lab PHP.

## Installation

Pattern Lab PHP uses [Composer](https://getcomposer.org/) to manage project dependencies. To install the default static assets run:

    composer require pattern-lab/styleguidekit-assets-default

## Development Requirements

In order to modify these assets you need to install the following:

* the [Development Edition of Pattern Lab PHP](https://github.com/pattern-lab/edition-php-development)
* [Node.js](http://nodejs.org) and NPM
* [Bower](http://bower.io)
* [Ruby Sass](http://sass-lang.com/install)
	
## Development Set-up

Once you've installed the requirements do the following to set-up for development:

1. `cd /path/to/dev-edition/packages/pattern-lab/styleguidekit-assets-default`
2. `git config branch.dev.remote origin`
3. `npm install`
4. `bower install`

## Making Changes

To make changes **always edit files in `src/`**. To make sure that these changes are reflected in the front-end and `dist/` folder run the following:

    gulp --copy-dist=../../../public

To watch for changes you can use:

    gulp --watch --copy-dist=../../../public

At this point changes to the static assets should compile to the correct locations in the project as well as `dist/`.
