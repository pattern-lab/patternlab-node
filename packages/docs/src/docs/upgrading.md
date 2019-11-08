---

title: Upgrading Pattern Lab | Pattern Lab
heading: Upgrading Pattern Lab
---

{% capture m %}

Pattern Lab uses [npm](https://www.npmjs.com/) to manage project dependencies. To upgrade an edition based on Pattern Lab 2 do the following:

1. In a terminal window navigate to the root of your project
2. Type `npm update`

During the upgrade process Pattern Lab 2 will move or add any files that are required for the new version to work. It will also update your configuration as appropriate.

It's recommended to review the [ChangeLog](https://github.com/pattern-lab/patternlab-node/wiki/ChangeLog) prior to any update so you are aware of upcoming changes. [Update Instructions](https://github.com/pattern-lab/patternlab-node/wiki/Upgrading) are also maintained on Github and may contain addenda should the normal upgrade process not apply.

## Upgrading from Pattern Lab 1.X to 2.X

1. Install a [node edition](https://github.com/pattern-lab?utf8=%E2%9C%93&query=edition-node) of Pattern Lab 2
2. Move the following files:

  * 1.X `source/*` to 2.X `source/`
  * 1.X `source/_patterns/00-atoms/00-meta/*` to 2.X `source/_meta/` (you can then delete `source/_patterns/00-atoms/00-meta/`)
  * 1.X `source/_data/annotations.js` to 2.X `source/_annotations/`

3. In `source/_meta/_00-head.mustache`, replace `{% raw %}{% pattern-lab-head %}{% endraw %}` with `{% raw %}{{{ patternLabHead }}}{% endraw %}`
4. In `source/_meta/_00-foot.mustache` replace `{% raw %}{% pattern-lab-foot %}{% endraw %}` with `{% raw %}{{{ patternLabFoot }}}{% endraw %}`
4. Remap the paths configured in the edition's `patternlab-config.json` file with yours, if needed.

<strong>The PHP version of Pattern Lab is being deprecated in favor of a new unified Pattern Lab core. <a href='./php/upgrading'>The PHP docs for this topic can be viewed here.</a></strong>

{% endcapture %}
{{ m | markdownify }}
