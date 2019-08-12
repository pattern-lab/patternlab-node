/* eslint-disable no-unused-vars */
import { define, props } from 'skatejs';
import { BaseComponent } from '../base-component.js';
import { urlHandler, patternName } from '../../utils';
import { h } from 'preact';

@define
class ToolsMenu extends BaseComponent {
  static is = 'pl-tools-menu';

  _stateChanged(state) {}

  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  connecting() {
    const { ishControlsHide } = window.ishControls;
    this.ishControlsHide = ishControlsHide;
  }

  handleClick(e) {
    const elem = e.target.closest('.pl-js-acc-handle');
    const panel = elem.nextSibling;

    // Activate selected panel
    elem.classList.toggle('pl-is-active');
    panel.classList.toggle('pl-is-active');
  }

  render() {
    const patternPath = urlHandler.getFileName(patternName);

    return (
      <div class="pl-c-tools">
        <button
          class="pl-c-tools__toggle pl-js-acc-handle"
          title="Tools"
          onClick={this.handleClick}
        >
          <svg
            class="pl-c-tools__toggle-icon"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
          >
            <title>Pattern Lab Tools</title>
            <path
              fill="currentColor"
              d="M12.767 8.343c-0.735-1.272-0.293-2.903 0.986-3.643l-1.376-2.383c-0.393 0.23-0.85 0.363-1.338 0.363-1.47 0-2.662-1.2-2.662-2.68h-2.752c0.004 0.457-0.11 0.92-0.355 1.343-0.735 1.272-2.367 1.705-3.649 0.967l-1.376 2.383c0.396 0.225 0.739 0.555 0.983 0.977 0.733 1.27 0.294 2.897-0.98 3.64l1.376 2.383c0.392-0.228 0.847-0.359 1.332-0.359 1.466 0 2.654 1.192 2.662 2.665h2.752c-0.001-0.452 0.113-0.91 0.355-1.329 0.733-1.27 2.362-1.703 3.642-0.971l1.376-2.383c-0.393-0.225-0.734-0.554-0.977-0.974zM7 9.835c-1.566 0-2.835-1.269-2.835-2.835s1.269-2.835 2.835-2.835c1.566 0 2.835 1.269 2.835 2.835s-1.269 2.835-2.835 2.835z"
            />
          </svg>
        </button>
        <ul class="pl-c-tools__list pl-js-acc-panel">
          <li class="pl-c-tools__item">
            <pl-toggle-info />
          </li>
          <li class="pl-c-tools__item">
            <pl-toggle-layout text="Switch Layout" />
          </li>
          <li class="pl-c-tools__item">
            <pl-toggle-theme />
          </li>

          {!this.ishControlsHide['views-new'] && (
            <li class="pl-c-tools__item">
              <a
                href={patternPath}
                class="pl-c-tools__action pl-js-open-new-window"
                target="_blank"
              >
                Open In New Tab
              </a>
            </li>
          )}

          {!this.ishControlsHide['tools-docs'] && (
            <li class="pl-c-tools__item">
              <a
                href="http://patternlab.io/docs/"
                class="pl-c-tools__action"
                target="_blank"
              >
                Pattern Lab Docs
              </a>
            </li>
          )}
        </ul>
      </div>
    );
  }
}
