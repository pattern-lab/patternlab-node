---
title: Integration with Grunt/Gulp
tags:
  - docs
---

**Note:** _These directions may be incomplete. They also require **v0.7.9** of the PHP version of Pattern Lab._

# Integration with Grunt

Setting up Grunt to work with the PHP version of Pattern Lab should be straightforward. To do so please do the following:

1. Open a terminal window
2. Type `npm install --save-dev grunt-shell` to install [grunt-shell](https://github.com/sindresorhus/grunt-shell)
3. Add the following to your `grunt.initConfig`. The `-p` flag ensures that Pattern Lab only generates patterns.

<pre><code>shell: {
  patternlab: {
    command: "php core/builder.php -gp"
  }
}</code></pre>

4. Add `grunt.loadNpmTasks('grunt-shell');` to your list of plugins.
5. Add `'shell:patternlab'` to your list of tasks in `grunt.registerTask`.

You should also be using `grunt-contrib-watch` to monitor changes to Pattern Lab's patterns and data. The Pattern Lab section for your `watch` might look like:

    html: {
      files: ['source/_patterns/**/*.mustache', 'source/_patterns/**/*.json', 'source/_data/*.json'],
      tasks: ['shell:patternlab'],
      options: {
        spawn: false
      }
    }

You might be able to use `livereload` as well but that hasn't been tested by us yet.

For more information, check out [this post about using Pattern Lab with Grunt](http://bradfrost.com/blog/post/using-grunt-with-pattern-lab/).
