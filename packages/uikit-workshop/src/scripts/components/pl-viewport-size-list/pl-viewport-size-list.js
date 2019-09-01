/* eslint-disable no-unused-vars */
import { h } from 'preact';
import { define, props } from 'skatejs';
import { BaseComponent } from '../base-component.js';
import { store } from '../../store.js'; // connect to redux

import { Tooltip } from '../pl-tooltip/pl-tooltip';
import VisuallyHidden from '@reach/visually-hidden';

import PhoneIcon from '../../../icons/phone.svg';
import TabletIcon from '../../../icons/tablet.svg';
import LaptopIcon from '../../../icons/laptop.svg';
import DesktopIcon from '../../../icons/desktop.svg';
import DiscoIcon from '../../../icons/disco-ball.svg';
import RandomIcon from '../../../icons/random.svg';

import { minViewportWidth, maxViewportWidth, getRandom } from '../../utils';

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

  connecting() {
    const state = store.getState();
    const { ishControlsHide } = window.ishControls;
    this.ishControlsHide = ishControlsHide;
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
          this.iframe.fullMode = false;
          this.iframe.sizeiframe(
            getRandom(
              window.config.ishViewportRange !== undefined
                ? parseInt(window.config.ishViewportRange.l[0], 10)
                : 800,
              maxViewportWidth
            ),
            true
          );
          break;
        case 'full':
          this.iframe.fullMode = true;
          this.iframe.sizeiframe(maxViewportWidth, true);
          break;
      }
    }
  }

  rendered() {
    this.iframe = document.querySelector('pl-iframe');
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
                >
                  <VisuallyHidden>Resize viewport to small</VisuallyHidden>
                  <PhoneIcon
                    width={14}
                    height={20}
                    fill="currentColor"
                    viewBox="0 0 24 12"
                  />
                </button>
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
                >
                  <VisuallyHidden>Resize viewport to medium</VisuallyHidden>
                  <TabletIcon
                    width={16}
                    height={24}
                    fill="currentColor"
                    viewBox="0 0 24 16"
                  />
                </button>
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
                >
                  <VisuallyHidden>Resize viewport to large</VisuallyHidden>
                  <LaptopIcon
                    width={24}
                    height={22}
                    fill="currentColor"
                    viewBox="0 0 24 20"
                  />
                </button>
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
                >
                  <VisuallyHidden>Resize viewport to full</VisuallyHidden>
                  <DesktopIcon
                    width={24}
                    height={22}
                    fill="currentColor"
                    viewBox="0 0 24 20"
                  />
                </button>
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
