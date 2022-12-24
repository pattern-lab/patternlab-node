/* eslint-disable no-unused-vars, no-shadow */
import { define, props } from 'skatejs';
import { h } from 'preact';

const classNames = require('classnames');

import { getParents } from './get-parents';
import { store } from '../../store.js'; // redux store
import { BaseComponent } from '../base-component.js';
import { iframeMsgDataExtraction } from '../../utils';
import Mousetrap from 'mousetrap';

import { NavTitle } from './src/NavTitle';
import { NavList } from './src/NavList';
import { NavLink } from './src/NavLink';
import { NavItem } from './src/NavItem';

@define
class Nav extends BaseComponent {
  static is = 'pl-nav';

  constructor() {
    super();
    this.toggleNavPanel = this.toggleNavPanel.bind(this);
    this.toggleSpecialNavPanel = this.toggleSpecialNavPanel.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleURLChange = this.handleURLChange.bind(this);
    this.handlePageClick = this.handlePageClick.bind(this);
    this._hasInitiallyRendered = false;
    this.receiveIframeMessage = this.receiveIframeMessage.bind(this);
    this.useShadow = false;
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
    this.isOpenClass = 'pl-is-active';
    const self = this;
    const state = store.getState();
    this.layoutMode = state.app.layoutMode || '';
    this.currentPattern = state.app.currentPattern || '';
    this.elem = this;
    this.previousActiveLinks = [];
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

  /**
   *
   * @param {MessageEvent} e A message received by a target object.
   */
  receiveIframeMessage(e) {
    const self = this;
    const data = iframeMsgDataExtraction(e);

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

  cleanupActiveNav(topLevelOnly) {
    this.navContainer = document.querySelector('.pl-js-nav-container');
    this.navAccordionTriggers = document.querySelectorAll('.pl-js-acc-handle');
    this.navAccordionPanels = document.querySelectorAll('.pl-js-acc-panel');
    this.topLevelTriggers = document.querySelectorAll(
      '.pl-c-nav__link--title.pl-is-active'
    );

    if (topLevelOnly === true && window.innerWidth > 670) {
      this.navContainer.classList.remove('pl-is-active');
      this.topLevelTriggers.forEach((trigger) => {
        trigger.classList.remove('pl-is-active');
        trigger.nextSibling.classList.remove('pl-is-active');
      });
    } else {
      if (this.layoutMode !== 'vertical') {
        this.navContainer.classList.remove('pl-is-active');
        this.navAccordionTriggers.forEach((trigger) => {
          trigger.classList.remove('pl-is-active');
        });
        this.navAccordionPanels.forEach((panel) => {
          panel.classList.remove('pl-is-active');
        });
      } else if (this.layoutMode === 'vertical' && window.innerWidth <= 670) {
        this.navContainer.classList.remove('pl-is-active');
        this.navAccordionTriggers.forEach((trigger) => {
          trigger.classList.remove('pl-is-active');
        });
        this.navAccordionPanels.forEach((panel) => {
          panel.classList.remove('pl-is-active');
        });
      } else {
        this.navContainer.classList.remove('pl-is-active');
      }
    }
  }

  handleClick(event, pattern) {
    event.preventDefault();
    this.iframeElem.navigateTo(pattern);
    this.cleanupActiveNav();
  }

  handleURLChange() {
    const currentPattern = this.currentPattern;
    this.activeLink = document.querySelector(
      `[data-patternpartial="${currentPattern}"]`
    );

    if (this.previousActiveLinks) {
      this.previousActiveLinks.forEach((link, index) => {
        this.previousActiveLinks[index].classList.remove('pl-is-active');
      });
    }
    this.previousActiveLinks = [];

    if (this.activeLink) {
      const triggers = [this.activeLink];
      const panels = Array.from(
        getParents(this.activeLink, '.pl-js-acc-panel')
      );

      panels.forEach((panel) => {
        const panelTrigger = panel.previousSibling;
        if (panelTrigger) {
          triggers.push(panelTrigger);
        }
      });

      triggers.forEach((trigger) => {
        trigger.classList.add('pl-is-active');
        this.previousActiveLinks.push(trigger);
      });
    }
  }

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

  toggleSpecialNavPanel(e) {
    const target = e.target;
    target.parentNode.classList.toggle('pl-is-active');
  }

  toggleNavPanel(e) {
    const target = e.target;

    target.classList.toggle('pl-is-active');

    // when the Nav renders as a dropdown menu, only allow one top-level menu item to be open at a time to prevent overlap issues
    if (
      this.layoutMode !== 'vertical' &&
      window.innerWidth > 670 &&
      target.classList.contains('pl-c-nav__link--title')
    ) {
      this.topLevelTriggers = document.querySelectorAll(
        '.pl-c-nav__link--title.pl-is-active'
      );

      this.topLevelTriggers.forEach((trigger) => {
        if (trigger !== target) {
          trigger.classList.remove('pl-is-active');
          trigger.nextSibling.classList.remove('pl-is-active');
        }
      });
    }
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
      <ol class="pl-c-nav__list pl-js-pattern-nav-target">
        {patternGroups.map((item, i) => {
          const patternItems = item.patternItems;

          return (
            <NavItem className={`pl-c-nav__item--${item.patternGroupLC}`}>
              <NavTitle
                aria-controls={item.patternGroupLC}
                onClick={this.toggleNavPanel}
              >
                {item.patternGroupUC}
              </NavTitle>
              <ol
                id={item.patternGroupLC}
                className={`pl-c-nav__sublist pl-c-nav__sublist--dropdown pl-js-acc-panel`}
              >
                {item.patternGroupItems.map((patternSubgroup, i) => {
                  return (
                    <NavList
                      elem={this.elem}
                      category={patternSubgroup.patternSubgroupLC}
                      categoryName={patternSubgroup.patternSubgroupUC}
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
                      <NavItem>
                        <NavLink item={patternItem} elem={this} />
                      </NavItem>
                    );
                  })}
              </ol>
            </NavItem>
          );
        })}

        {/* display the All link if window.ishControlsHide is undefined (for some reason) OR window.ishControls.ishControlsHide doesn't have `views-all` and/or `all` set to true */}
        {(window.ishControls === undefined ||
          window.ishControls.ishControlsHide === undefined ||
          (window.ishControls.ishControlsHide['views-all'] !== true &&
            window.ishControls.ishControlsHide.all !== true)) &&
          !this.noViewAll && (
            <NavItem>
              <a
                onClick={(e) => this.handleClick(e, 'all')}
                href="styleguide/html/styleguide.html"
                class="pl-c-nav__link pl-c-nav__link--pattern"
                data-patternpartial="all"
                tabindex="0"
              >
                All
              </a>
            </NavItem>
          )}
      </ol>
    );
  }
}

export { Nav };
