import { html, LitElement, customElement } from 'lit-element';
import styles from './pl-icon.scss?external';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
const icons = {};

// automatically pull in every SVG icon file in from the icons folder
const svgIcons = require.context('../../../icons', true, /\.svg$/);
svgIcons.keys().forEach((iconName) => {
  const name = iconName.replace('./', '');
  const icon = import(`../../../icons/${name}`);

  icon.then((Icon) => {
    icons[Icon.default.id] = Icon.default;
  });
});

// This decorator defines the element.
@customElement('pl-icon')
class Icon extends LitElement {
  static get properties() {
    return {
      name: String,
      size: String,
    };
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  // Render element DOM by returning a `lit-html` template.
  render() {
    const svgMarkup = `
        <svg
        class="c-icon c-icon--${this.name} c-icon--${this.size || 'auto'}"
        viewBox="${
          icons[this.name] && icons[this.name].viewBox
            ? icons[this.name].viewBox
            : '0 0 20 20'
        }"
      >
        <use xlink:href="#${
          icons[this.name] && icons[this.name].id
            ? icons[this.name].id
            : this.name
        }">
        </use>
      </svg>
    `;

    return html` ${unsafeHTML(svgMarkup)} `;
  }
}

export { Icon };
