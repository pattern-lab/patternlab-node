/* eslint-disable no-unused-vars */
import { h } from 'preact';
import { define, props } from 'skatejs';
import { BaseComponent } from '../../components/base-component.js';
import { store } from '../../store.js'; // connect to redux

import { Tooltip } from '../../components/pl-tooltip/pl-tooltip';
import VisuallyHidden from '@reach/visually-hidden';

import { minViewportWidth, maxViewportWidth, getRandom } from '../../utils';

import styles from './pl-viewport-size-list.scss?external';

// @todo: re-add keyboard shortcuts to these
@define
class ViewportSizes extends BaseComponent {
  static is = 'pl-viewport-sizes';

  _stateChanged(state) {
    this.triggerUpdate();
  }

  constructor(self) {
    self = super(self);
    self.resizeViewport = self.resizeViewport.bind(self);
    self.useShadow = false;
    return self;
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    styles.use();
    const state = store.getState();
    const { ishControlsHide } = window.ishControls;
    this.ishControlsHide = ishControlsHide;
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    styles.unuse();
  }

  shouldUpdate(prevProps, prevState) {
    return true;
  }

  resizeViewport(size) {
    if (this.iframe) {
      switch (size) {
        case 'small':
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              minViewportWidth,
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.s[1], 10)
                : 500
            ),
            true
          );
          break;
        case 'medium':
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.m[0], 10)
                : 500,
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.m[1], 10)
                : 800
            ),
            true
          );
          break;
        case 'large':
          // Do not evaluate a number higher than the clientWidth of the Iframe
          // to prevent having max size multiple times
          const max =
            maxViewportWidth > this.iframe.clientWidth
              ? this.iframe.clientWidth
              : maxViewportWidth;

          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.l[0], 10)
                : 800,
              max
            ),
            true
          );
          break;
        case 'full':
          this.iframe.fullMode = true;
          this.iframe.sizeiframe(this.iframe.clientWidth, true);
          break;
      }
    }
  }

  rendered() {
    this.iframe = document.querySelector('pl-iframe');
    this.iframeElem = document.querySelector('pl-iframe iframe');
  }

  render() {
    return (
      <ul class="pl-c-size-list">
        {!this.ishControlsHide.s && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Small"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-s',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('small')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to small</span>
                      <pl-icon name="phone"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {!this.ishControlsHide.m && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Medium"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-m',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('medium')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to medium</span>
                      <pl-icon name="tablet"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {!this.ishControlsHide.l && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Large"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-l',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('large')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to large</span>
                      <pl-icon name="laptop"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {!this.ishControlsHide.full && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Full"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-full',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('full')}
                  dangerouslySetInnerHTML={{
                    __html: `
                      <span class="is-vishidden">Resize viewport to full</span>
                      <pl-icon name="desktop"></pl-icon>
                    `,
                  }}
                />
              )}
            </Tooltip>
          </li>
        )}
        {/* {!this.ishControlsHide.random && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Random"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-random',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('random')}
                >
                  <VisuallyHidden>Resize viewport to random</VisuallyHidden>
                  <RandomIcon
                    width={24}
                    height={24}
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 28 28"
                  />
                </button>
              )}
            </Tooltip>
          </li>
        )} */}
        {/* {!this.ishControlsHide.disco && (
          <li class="pl-c-size-list__item">
            <Tooltip
              placement="top"
              trigger="hover"
              tooltip="Disco"
              usePortal={false}
            >
              {({ getTriggerProps, triggerRef }) => (
                <button
                  {...getTriggerProps({
                    className: 'pl-c-size-list__action',
                    id: 'pl-size-disco',
                    ref: triggerRef,
                  })}
                  onClick={e => this.resizeViewport('disco')}
                >
                  <VisuallyHidden>
                    Resize viewport using disco mode!
                  </VisuallyHidden>
                  <DiscoIcon
                    width={24}
                    height={24}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  />
                </button>
              )}
            </Tooltip>
          </li>
        )} */}
        {!this.ishControlsHide.hay && (
          <li class="pl-c-size-list__item">
            <button class="pl-c-size-list__action mode-link" id="pl-size-hay">
              Hay!
            </button>
          </li>
        )}
      </ul>
    );
  }
}
