import { define, props } from 'skatejs';
import { h } from 'preact';
const classNames = require('classnames');

import { BaseComponent } from '../base-component.js';
import $ from 'jquery';

const Button = props => {
  return (
    <button
      class="pl-c-nav__link pl-c-nav__link--dropdown pl-js-acc-handle"
      role="tab"
      {...props}
    >
      {props.children}
    </button>
  );
};

@define
class Nav extends BaseComponent {
  static is = 'pl-nav';

  _stateChanged(state) {}

  constructor() {
    super();
    this.toggleNavPanel = this.toggleNavPanel.bind(this);
  }

  toggleNavPanel(e) {
    const $this = $(e.target);
    const $panel = $this.next('.pl-js-acc-panel');
    const subnav = $this
      .parent()
      .parent()
      .hasClass('pl-js-acc-panel');

    //Close other panels if link isn't a subnavigation item
    if (!subnav) {
      $('.pl-js-acc-handle')
        .not($this)
        .removeClass('pl-is-active');
      $('.pl-js-acc-panel')
        .not($panel)
        .removeClass('pl-is-active');
    }

    //Activate selected panel
    $this.toggleClass('pl-is-active');
    $panel.toggleClass('pl-is-active');
  }

  render() {
    const patternTypes = window.navItems.patternTypes;
    // const patternItems = window.navItems.patternItems;

    return (
      <ol class="pl-c-nav__list pl-js-pattern-nav-target">
        {patternTypes.map((item, i) => {
          const classes = classNames({
            [`pl-c-nav__item pl-c-nav__item--${item.patternTypeLC}`]: true,
          });

          const patternItems = item.patternItems;

          return (
            <li className={classes}>
              <Button
                aria-controls={item.patternTypeLC}
                onClick={this.toggleNavPanel}
              >
                {item.patternTypeUC}
              </Button>

              <ol
                id={item.patternSubtypeUC}
                class="pl-c-nav__sublist pl-c-nav__sublist--dropdown pl-js-acc-panel"
              >
                {item.patternTypeItems.map((patternSubtype, i) => {
                  return (
                    <li
                      className={`pl-c-nav__item pl-c-nav__item--${patternSubtype.patternSubtypeLC}`}
                    >
                      <Button
                        aria-controls={patternSubtype.patternSubtypeUC}
                        onClick={this.toggleNavPanel}
                      >
                        {patternSubtype.patternSubtypeUC}
                      </Button>

                      <ol
                        id={patternSubtype.patternSubtypeUC}
                        class="pl-c-nav__subsublist pl-c-nav__subsublist--dropdown pl-js-acc-panel"
                      >
                        {patternSubtype.patternSubtypeItems.map(
                          (patternSubtypeItem, i) => {
                            return (
                              <li class="pl-c-nav__item">
                                <a
                                  href={`patterns/${patternSubtypeItem.patternPath}`}
                                  class="pl-c-nav__link pl-c-nav__link--sublink"
                                  data-patternpartial={
                                    patternSubtypeItem.patternPartial
                                  }
                                >
                                  {patternSubtypeItem.patternName}

                                  {patternSubtypeItem.patternState && (
                                    <span
                                      class={`pl-c-pattern-state pl-c-pattern-state--${patternSubtypeItem.patternState}`}
                                      title={patternSubtypeItem.patternState}
                                    />
                                  )}
                                </a>
                              </li>
                            );
                          }
                        )}
                      </ol>
                    </li>
                  );
                })}

                {patternItems &&
                  patternItems.map((patternItem, i) => {
                    return (
                      <li class="pl-c-nav__item">
                        <a
                          href={`patterns/${patternItem.patternPath}`}
                          class="pl-c-nav__link"
                          data-patternpartial={patternItem.patternPartial}
                          tabindex="0"
                        >
                          {patternItem.patternName}

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

        <li class="pl-c-nav__item">
          <a
            href="styleguide/html/styleguide.html"
            class="pl-c-nav__link"
            data-patternpartial="all"
            tabindex="0"
          >
            All
          </a>
        </li>
      </ol>
    );
  }
}

export { Nav };
