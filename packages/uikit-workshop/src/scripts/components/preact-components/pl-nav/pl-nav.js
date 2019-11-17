/* eslint-disable no-unused-vars, no-shadow */
import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');
import { store } from '@pattern-lab/uikit-data'; // redux store
import { PreactComponent } from '@pattern-lab/uikit-base';
import Mousetrap from 'mousetrap';
import 'url-search-params-polyfill';

const SubSubList = props => {
  const { children, category, elem } = props;
  const reorderedChildren = [];

  const nonViewAllItems = children.filter(
    item =>
      item.patternName !== 'View All' && !item.patternName.includes(' Docs')
  );
  // const nonViewAllItems = children.filter((item => (item.patternName !== 'View All')));
  const viewAllItems = children.filter(item => item.patternName === 'View All');

  reorderedChildren.push(...viewAllItems, ...nonViewAllItems);

  return (
    <li className={`pl-c-nav__item pl-c-nav__item--${category.toLowerCase()}`}>
      {viewAllItems.length > 0 ? (
        viewAllItems.map(patternSubtypeItem => (
          <div class="pl-c-nav__link--overview-wrapper">
            <a
              href={`patterns/${patternSubtypeItem.patternPath}`}
              className={`pl-c-nav__link pl-c-nav__link--sublink
                ${
                  patternSubtypeItem.patternName === 'View All'
                    ? 'pl-c-nav__link--overview pl-js-link-overview'
                    : 'pl-c-nav__link--subsublink'
                }
                `}
              onClick={e =>
                elem.handleClick(e, patternSubtypeItem.patternPartial)
              }
              data-patternpartial={patternSubtypeItem.patternPartial}
            >
              {patternSubtypeItem.patternName === 'View All'
                ? `${category}`
                : patternSubtypeItem.patternName}
              {patternSubtypeItem.patternState && (
                <span
                  class={`pl-c-pattern-state pl-c-pattern-state--${patternSubtypeItem.patternState}`}
                  title={patternSubtypeItem.patternState}
                />
              )}
            </a>

            {nonViewAllItems.length >= 1 && (
              <SpecialButton
                aria-controls={category}
                onClick={elem.toggleSpecialNavPanel}
              >
                {category}
              </SpecialButton>
            )}
          </div>
        ))
      ) : (
        <Button aria-controls={category} onClick={elem.toggleNavPanel}>
          {category}
        </Button>
      )}

      {((viewAllItems.length && nonViewAllItems.length) ||
        viewAllItems.length === 0) && (
        <ol
          id={category}
          className={`pl-c-nav__subsublist pl-c-nav__subsublist--dropdown pl-js-acc-panel`}
        >
          {nonViewAllItems.map(patternSubtypeItem => (
            <li class="pl-c-nav__item">
              <a
                href={`patterns/${patternSubtypeItem.patternPath}`}
                className={`pl-c-nav__link pl-c-nav__link--sublink
                      ${
                        patternSubtypeItem.patternName === 'View All'
                          ? 'pl-c-nav__link--overview'
                          : 'pl-c-nav__link--subsublink'
                      }
                    `}
                onClick={e =>
                  elem.handleClick(e, patternSubtypeItem.patternPartial)
                }
                data-patternpartial={patternSubtypeItem.patternPartial}
              >
                {patternSubtypeItem.patternName === 'View All'
                  ? `${category} Overview`
                  : patternSubtypeItem.patternName}
                {patternSubtypeItem.patternState && (
                  <span
                    class={`pl-c-pattern-state pl-c-pattern-state--${patternSubtypeItem.patternState}`}
                    title={patternSubtypeItem.patternState}
                  />
                )}
              </a>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
};

const SpecialButton = props => {
  return (
    <button
      className={`pl-c-nav__link pl-c-nav__link--section-dropdown pl-js-acc-handle`}
      role="tab"
      {...props}
    >
      {props.children}
      <span
        class="pl-c-nav__link-icon"
        dangerouslySetInnerHTML={{
          __html: '<pl-icon name="arrow-down"></pl-icon>',
        }}
      />
    </button>
  );
};

const Button = props => {
  return (
    <button
      className={`pl-c-nav__link pl-c-nav__link--dropdown pl-js-acc-handle`}
      role="tab"
      {...props}
    >
      <span className={`pl-c-nav__link-text`}>{props.children}</span>
      <span
        class="pl-c-nav__link-icon"
        dangerouslySetInnerHTML={{
          __html: '<pl-icon name="arrow-down"></pl-icon>',
        }}
      />
    </button>
  );
};

const ButtonTitle = props => {
  return (
    <button
      className={`pl-c-nav__link pl-c-nav__link--title pl-js-acc-handle`}
      role="tab"
      {...props}
    >
      <span
        class="pl-c-nav__link-icon"
        dangerouslySetInnerHTML={{
          __html: '<pl-icon name="arrow-down"></pl-icon>',
        }}
      />
      <span className={`pl-c-nav__link-text`}>{props.children}</span>
    </button>
  );
};

@define
class Nav extends PreactComponent {
  static is = 'pl-nav';

  constructor(self) {
    self = super(self);
    self.toggleNavPanel = self.toggleNavPanel.bind(self);
    self.toggleSpecialNavPanel = self.toggleSpecialNavPanel.bind(self);
    self.handleClick = self.handleClick.bind(self);
    self.handleURLChange = self.handleURLChange.bind(self);
    self.handlePageClick = self.handlePageClick.bind(self);
    self._hasInitiallyRendered = false;
    self.receiveIframeMessage = self.receiveIframeMessage.bind(self);
    self.useShadow = false;
    return self;
  }

  handlePageClick(e) {
    if (
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

    if (this.currentPattern !== state.app.currentPattern) {
      if (
        state.app.currentPattern !== '' &&
        this.currentPattern !== state.app.currentPattern &&
        this._hasInitiallyRendered === true
      ) {
        this.handleURLChange(); // so the nav logic is always correct (ex. layout changes)
      }

      this.currentPattern = state.app.currentPattern;
    }
  }

  receiveIframeMessage(event) {
    const self = this;

    // does the origin sending the message match the current host? if not dev/null the request
    if (
      window.location.protocol !== 'file:' &&
      event.origin !== window.location.protocol + '//' + window.location.host
    ) {
      return;
    }

    let data = {};
    try {
      data =
        typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
    } catch (e) {
      // @todo: how do we want to handle exceptions here?
    }

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
      this.topLevelTriggers.forEach(trigger => {
        trigger.classList.remove('pl-is-active');
        trigger.nextSibling.classList.remove('pl-is-active');
      });
    } else {
      if (this.layoutMode !== 'vertical') {
        this.navContainer.classList.remove('pl-is-active');
        this.navAccordionTriggers.forEach(trigger => {
          trigger.classList.remove('pl-is-active');
        });
        this.navAccordionPanels.forEach(panel => {
          panel.classList.remove('pl-is-active');
        });
      } else if (this.layoutMode === 'vertical' && window.innerWidth <= 670) {
        this.navContainer.classList.remove('pl-is-active');
        this.navAccordionTriggers.forEach(trigger => {
          trigger.classList.remove('pl-is-active');
        });
        this.navAccordionPanels.forEach(panel => {
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
    const shouldAutoOpenNav = true;

    const currentPattern = this.currentPattern;
    const activeLink = document.querySelector(
      `[data-patternpartial="${currentPattern}"]`
    );
    const self = this;

    if (this.previousActiveLinks) {
      this.previousActiveLinks.forEach(function(link, index) {
        self.previousActiveLinks[index].classList.remove('pl-is-active');
      });
    }
    this.previousActiveLinks = [];

    if (activeLink) {
      activeLink.classList.add('pl-is-active');
      this.previousActiveLinks.push(activeLink);

      if (
        activeLink.parentNode.classList.contains(
          'pl-c-nav__link--overview-wrapper'
        )
      ) {
        activeLink.parentNode.classList.add('pl-is-active');
        this.previousActiveLinks.push(activeLink.parentNode);
      }

      const parentDropdown = activeLink.closest('.pl-js-acc-panel');
      let parentDropdownTrigger;

      if (parentDropdown) {
        if (parentDropdown.previousSibling) {
          parentDropdownTrigger = parentDropdown.previousSibling;

          if (
            parentDropdown.previousSibling.classList.contains(
              'pl-c-nav__link--overview-wrapper'
            ) &&
            shouldAutoOpenNav
          ) {
            parentDropdown.previousSibling.classList.add('pl-is-active');
            this.previousActiveLinks.push(parentDropdown.previousSibling);
            parentDropdownTrigger = parentDropdown.previousSibling.querySelector(
              '.pl-js-acc-handle'
            );
          }

          const grandparentDropdown = parentDropdown.closest(
            '.pl-c-nav__sublist--dropdown'
          );
          const grandparentDropdownTrigger =
            grandparentDropdown.previousSibling;

          if (grandparentDropdownTrigger && shouldAutoOpenNav) {
            if (shouldAutoOpenNav) {
              grandparentDropdownTrigger.classList.add('pl-is-active');
            }
            this.previousActiveLinks.push(grandparentDropdownTrigger);
          }
        }
      }
    } else {
      this.cleanupActiveNav();
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
  };

  toggleSpecialNavPanel(e) {
    const target = e.target;
    target.parentNode.classList.toggle('pl-is-active');
  }

  toggleNavPanel(e) {
    const target = e.target;
    target.classList.toggle('pl-is-active');
  }

  rendered() {
    if (this._hasInitiallyRendered === false) {
      this._hasInitiallyRendered = true;
    }

    this.handleURLChange();

    if (this.layoutMode !== 'vertical' && window.innerWidth > 670) {
      this.cleanupActiveNav(true);
    }
  }

  render({ layoutMode }) {
    const patternTypes = window.navItems.patternTypes;

    return (
      <ol class="pl-c-nav__list pl-js-pattern-nav-target">
        {patternTypes.map((item, i) => {
          const classes = classNames({
            [`pl-c-nav__item pl-c-nav__item--${item.patternTypeLC}`]: true,
          });

          const patternItems = item.patternItems;

          return (
            <li className={classes}>
              <ButtonTitle
                aria-controls={item.patternTypeLC}
                onClick={this.toggleNavPanel}
              >
                {item.patternTypeUC}
              </ButtonTitle>

              <ol
                id={item.patternSubtypeUC}
                className={`pl-c-nav__sublist pl-c-nav__sublist--dropdown pl-js-acc-panel`}
              >
                {item.patternTypeItems.map((patternSubtype, i) => {
                  return (
                    <SubSubList
                      elem={this.elem}
                      category={patternSubtype.patternSubtypeUC}
                    >
                      {patternSubtype.patternSubtypeItems}
                    </SubSubList>
                  );
                })}

                {patternItems &&
                  patternItems.map((patternItem, i) => {
                    return (
                      <li class="pl-c-nav__item">
                        <a
                          href={`patterns/${patternItem.patternPath}`}
                          class="pl-c-nav__link pl-c-nav__link--pattern"
                          onClick={e =>
                            this.handleClick(e, patternItem.patternPartial)
                          }
                          data-patternpartial={patternItem.patternPartial}
                          tabindex="0"
                        >
                          {patternItem.patternName === 'View All'
                            ? patternItem.patternName + ' ' + item.patternTypeUC
                            : patternItem.patternName}
                          {patternItem.patternState && (
                            <span
                              class={`pl-c-pattern-state pl-c-pattern-state--${patternItem.patternState}`}
                              title={patternItem.patternState}
                            />
                          )}
                        </a>
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
            window.ishControls.ishControlsHide.all !== true)) && (
          <li class="pl-c-nav__item">
            <a
              onClick={e => this.handleClick(e, 'all')}
              href="styleguide/html/styleguide.html"
              class="pl-c-nav__link pl-c-nav__link--pattern"
              data-patternpartial="all"
              tabindex="0"
            >
              All
            </a>
          </li>
        )}
      </ol>
    );
  }
}

export { Nav };
