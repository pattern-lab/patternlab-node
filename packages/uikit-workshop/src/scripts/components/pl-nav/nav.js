/* eslint-disable no-unused-vars, no-shadow */
import { define, props } from 'skatejs';
// this line is required for rendering even if it is note used in the code
import { h, Fragment } from 'preact';

const classNames = require('classnames');

import { getParents } from './get-parents';
import { store } from '../../store.js'; // redux store
import { BaseComponent } from '../base-component.js';
import Mousetrap from 'mousetrap';

import { NavLink } from './nav-link';
import { NavList } from './nav-list';
import { iframeMsgDataExtraction } from '../../utils';

@define
class Nav extends BaseComponent {
  static is = 'pl-nav';

  static props = {
    autoClose: {
      ...props.boolean,
      ...{ default: true },
    },
    currentPattern: props.string,
    layoutMode: props.string,
    collapsedByDefault: {
      ...props.boolean,
      ...{ default: true },
    },
    noViewAll: {
      ...props.boolean,
      ...{ default: window.config?.theme?.noViewAll || false },
    },
  };

  constructor(self) {
    self = super(self);
    self.panelToggle = self.panelToggle.bind(self);
    self.iconOnlyPanelToggle = self.iconOnlyPanelToggle.bind(self);
    self.handleClick = self.handleClick.bind(self);
    self.handleTopLevelNavClick = self.handleTopLevelNavClick.bind(self);
    self.handleURLChange = self.handleURLChange.bind(self);
    self.handlePageClick = self.handlePageClick.bind(self);
    self._hasInitiallyRendered = false;
    self.receiveIframeMessage = self.receiveIframeMessage.bind(self);
    self.useShadow = false;
    return self;
  }

  handlePageClick(e) {
    if (
      e.target.closest &&
      e.target.closest('.pl-c-nav') === null &&
      e.target.closest('.pl-js-nav-trigger') === null &&
      e.target.closest('svg') === null &&
      e.target.closest('pl-toggle-layout') === null
    ) {
      if (this.layoutMode !== 'vertical' && window.innerWidth > 670) {
        this.cleanupActiveNav(true);
      }
    }
  }

  connected() {
    this.isOpenClass = 'is-open';
    const state = store.getState();
    this.layoutMode = state.app.layoutMode || '';
    this.currentPattern = state.app.currentPattern || '';
    this.elem = this;
    this.previouslyActiveLinks = [];
    this.iframeElem = document.querySelector('pl-iframe');

    window.addEventListener('message', this.receiveIframeMessage, false);
    document.body.addEventListener('click', this.handlePageClick);
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();

    Mousetrap.bind('esc', () => {
      if (this.layoutMode !== 'vertical' && window.innerWidth > 670) {
        this.cleanupActiveNav(true);
      }
    });
  }

  disconnected() {
    super.disconnected && super.disconnected();
    document.body.removeEventListener('click', this.handlePageClick);
    window.removeEventListener('message', this.receiveIframeMessage);
  }

  _stateChanged(state) {
    if (this.layoutMode !== state.app.layoutMode) {
      this.layoutMode = state.app.layoutMode || '';
    }

    if (
      state.app.currentPattern &&
      this.currentPattern !== state.app.currentPattern
    ) {
      this.currentPattern = state.app.currentPattern;
      this.handleURLChange(); // so the nav logic is always correct (ex. layout changes)
    }
  }

  receiveIframeMessage(event) {
    const self = this;
    const data = iframeMsgDataExtraction(event);

    if (data.event !== undefined && data.event === 'patternLab.pageClick') {
      try {
        if (self.layoutMode !== 'vertical') {
          self.cleanupActiveNav(true);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * Helper method that partially cleans up the active nav links
   * @param {boolean} topLevelOnly - only clean up the top most level nav links
   * @param {Node} exceptFor - optionally specify an element to skip cleaning up
   */
  cleanupActiveNav(topLevelOnly, exceptFor) {
    this.navContainer = document.querySelector('.pl-js-nav-container');
    this.topLevelTriggers = document.querySelectorAll(
      '.pl-c-nav__link--title.is-open'
    );

    if (topLevelOnly === true && window.innerWidth > 670) {
      this.navContainer.classList.remove('is-open');
      this.topLevelTriggers.forEach((trigger) => {
        if (trigger !== exceptFor || exceptFor === undefined) {
          trigger.classList.remove('is-open');
        }
      });
    } else {
      this.navContainer.classList.remove('is-open');
    }
  }

  handleClick(event, pattern) {
    event.preventDefault();
    this.iframeElem.navigateTo(pattern);
    this.cleanupActiveNav();
  }

  // auto-close other top level nav dropdowns on larger screens
  handleTopLevelNavClick(e) {
    if (this.layoutMode !== 'vertical' && window.innerWidth > 670) {
      this.cleanupActiveNav(true, e.target);
    }
    this.panelToggle(e.target);
  }

  handleURLChange() {
    const currentPattern = this.currentPattern;
    this.activeLink = document.querySelector(
      `[data-patternpartial="${currentPattern}"]`
    );

    if (this.previouslyActiveLinks) {
      this.previouslyActiveLinks.forEach((link, index) => {
        this.previouslyActiveLinks[index].classList.remove('is-open');
        this.previouslyActiveLinks[index].classList.remove('is-active');
      });
    }
    this.previouslyActiveLinks = [];

    if (this.activeLink) {
      this.activeLink.classList.add('is-active');

      const triggers = [this.activeLink];
      const panels = Array.from(
        getParents(this.activeLink, '.pl-js-nav-accordion')
      );

      panels.forEach((panel) => {
        const panelTrigger = panel.previousSibling;
        if (panelTrigger) {
          if (panelTrigger.previousSibling) {
            triggers.push(panelTrigger.previousSibling);
          } else {
            triggers.push(panelTrigger);
          }
        }
      });

      triggers.forEach((trigger) => {
        trigger.classList.add('is-open');
        this.previouslyActiveLinks.push(trigger);
      });
    }
  }

  iconOnlyPanelToggle(target) {
    target.previousSibling.classList.toggle('is-open');
  }

  panelToggle(target) {
    target.classList.toggle('is-open');
  }

  rendered() {
    if (this._hasInitiallyRendered === false) {
      this._hasInitiallyRendered = true;
    }

    if (!this.activeLink) {
      this.handleURLChange();
    }

    if (this.layoutMode !== 'vertical' && window.innerWidth > 670) {
      this.cleanupActiveNav(true);
    }
  }

  render({ layoutMode }) {
    const patternGroups = window.navItems.patternGroups;

    return (
      <ol class="pl-c-nav__list">
        {patternGroups.map((item, i) => {
          const classes = classNames('pl-c-nav__list-item');
          const patternItems = item.patternItems;

          return (
            <li className={classes}>
              <NavLink
                iconPos={'before'}
                iconName={'arrow-down'}
                isTitle={true}
                aria-controls={item.patternGroupLC}
                onClick={this.handleTopLevelNavClick}
              >
                {item.patternGroupLC}
              </NavLink>
              <ol
                id={item.patternSubgroupUC}
                className={`pl-c-nav__list pl-c-nav__accordion pl-c-nav__dropdown pl-js-nav-accordion`}
              >
                {item.patternGroupItems.map((patternSubgroup, i) => {
                  return (
                    <NavList
                      elem={this.elem}
                      category={patternSubgroup.patternSubgroupUC}
                    >
                      {patternSubgroup.patternSubgroupItems}
                    </NavList>
                  );
                })}

                {patternItems &&
                  patternItems.map((patternItem, i) => {
                    return this.noViewAll &&
                      patternItem.patternPartial.includes('viewall') ? (
                      ''
                    ) : (
                      <li class="pl-c-nav__list-item">
                        <NavLink
                          href={`patterns/${patternItem.patternPath}`}
                          level={1}
                          onClick={(e) =>
                            this.handleClick(e, patternItem.patternPartial)
                          }
                          data-patternpartial={patternItem.patternPartial}
                          state={patternItem.patternState}
                        >
                          {patternItem.patternName === 'View All'
                            ? patternItem.patternName + ' ' + item.patternTypeUC
                            : patternItem.patternName}
                        </NavLink>
                      </li>
                    );
                  })}
              </ol>
            </li>
          );
        })}

        {/* display the All link if window.ishControlsHide is undefined (for some reason) OR window.ishControls.ishControlsHide doesn't have `views-all` and/or `all` set to true */}
        {(window.ishControls === undefined ||
          window.ishControls.ishControlsHide === undefined ||
          (window.ishControls.ishControlsHide['views-all'] !== true &&
            window.ishControls.ishControlsHide.all !== true)) &&
          !this.noViewAll && (
            <li class="pl-c-nav__list-item">
              <NavLink
                onClick={(e) => this.handleClick(e, 'all')}
                href="styleguide/html/styleguide.html"
                level={0}
                data-patternpartial="all"
              >
                All
              </NavLink>
            </li>
          )}
      </ol>
    );
  }
}

export { Nav };
