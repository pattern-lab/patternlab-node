const rssPlugin = require('@11ty/eleventy-plugin-rss');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const eleventyNavigationPlugin = require('@11ty/eleventy-navigation');
const fs = require('fs');

// Import filters
const dateFilter = require('./src/filters/date-filter.js');
const markdownFilter = require('./src/filters/markdown-filter.js');
const w3DateFilter = require('./src/filters/w3-date-filter.js');

// Import transforms
const htmlMinTransform = require('./src/transforms/html-min-transform.js');
const parseTransform = require('./src/transforms/parse-transform.js');

// Import data files
const site = require('./src/_data/site.json');

module.exports = function(config) {
	// Filters
	config.addFilter('dateFilter', dateFilter);
	config.addFilter('markdownFilter', markdownFilter);
	config.addFilter('w3DateFilter', w3DateFilter);

	// Layout aliases
	config.addLayoutAlias('home', 'layouts/home.njk');

	// Transforms
	config.addTransform('htmlmin', htmlMinTransform);
	config.addTransform('parse', parseTransform);

	// Passthrough copy
	config.addPassthroughCopy('src/images');
	config.addPassthroughCopy('src/js');
	config.addPassthroughCopy('src/admin/config.yml');
	config.addPassthroughCopy('src/admin/previews.js');
	config.addPassthroughCopy('node_modules/nunjucks/browser/nunjucks-slim.js');

	const now = new Date();

	// Custom collections
	const livePosts = post => post.date <= now && !post.data.draft;
	config.addCollection('posts', collection => {
		return [
			...collection.getFilteredByGlob('./src/posts/*.md').filter(livePosts)
		].reverse();
	});

	config.addCollection('demos', collection => {
		return [...collection.getFilteredByGlob('./src/demos/*.md')].reverse();
	});

	config.addCollection('postFeed', collection => {
		return [...collection.getFilteredByGlob('./src/posts/*.md').filter(livePosts)]
			.reverse()
			.slice(0, site.maxPostsPerPage);
	});

	config.addCollection('docs', collection => {
		return [...collection.getFilteredByGlob('./src/docs/*.md')].reverse();
	});

	config.addCollection('docsOrdered', collection => {
		const docs = collection.getFilteredByGlob('src/docs/*.md').sort((a, b) => {
			return Number(a.data.order) - Number(b.data.order);
		});
		return docs;
	});

	// Plugins
	config.addPlugin(rssPlugin);
	config.addPlugin(syntaxHighlight);
	config.addPlugin(eleventyNavigationPlugin);

	// 404
	config.setBrowserSyncConfig({
		callbacks: {
			ready: function(err, browserSync) {
				const content_404 = fs.readFileSync('dist/404.html');

				browserSync.addMiddleware('*', (req, res) => {
					// Provides the 404 content without redirect.
					res.write(content_404);
					res.end();
				});
			}
		}
	});

	return {
		dir: {
			input: 'src',
			output: 'dist'
		},
		passthroughFileCopy: true
	};
};
