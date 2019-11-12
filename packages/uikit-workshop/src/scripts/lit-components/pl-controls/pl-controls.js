import { BaseLitComponent } from '../../components/base-component';
import { html, customElement } from 'lit-element';
import styles from './pl-controls.scss?external';

@customElement('pl-controls')
class Controls extends BaseLitComponent {
  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  render() {
    return html`
      <div class="pl-c-controls">
        <pl-viewport-size></pl-viewport-size>
        <pl-viewport-sizes></pl-viewport-sizes>
        <pl-tools-menu></pl-tools-menu>
      </div>
    `;
  }
}

export { Controls };
