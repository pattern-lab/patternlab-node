---
title: Managing Pattern Assets
tags:
    - docs
---

Assets for patterns - including JavaScript, CSS, and images - should be stored and edited in the `./source/` directory. Pattern Lab will move these assets to the `./public/` directory for you when you generate your site or when you watch the `./source/` directory for changes. **You can name and organize your assets however you like.** If you would like to use `./source/stylesheets/` to store your styles instead of `./source/css/` you can do that. There is nothing to configure. The structure will be maintained when they're moved to the `./public/` directory.

## Ignoring and Not Moving Assets Based on File Extension

By default, Pattern Lab will not move assets with the following file extensions:

-   `.less`
-   `.scss`
-   `.DS_Store`

To ignore more file extensions edit the `ie` configuration option in `./config/config.yml`. For example, to ignore `*.png` files your `ie` configuration option would look like:

    ie:
      - DS_Store
      - less
      - scss
      - png

## Ignoring and Not Moving Assets Based on Directory

By default, the PHP version of Pattern Lab will ignore **all** assets in directories that exactly match:

-   `scss`

To ignore more directories just edit the `id` configuration option in `./config/config.yml`. For example, to ignore directories named `test/` your `id` configuration option would look like:

    id:
      - scss
      - test

**Important:** Pattern Lab will only ignore exact matches of ignored directories. For example, if you had a directory named `cool_scss/` it, and the assets underneath it, _would_ be moved to `./public/` even though `scss` was in the name of the directory.

## Adding Assets to the Pattern Header &amp; Footer

Static assets like Javascript and CSS **are not** added automagically to your patterns. You need to add them manually to the [shared pattern header and footer](/docs/pattern-header-footer.html).
