// this line is required for rendering even if it is note used in the code
import { h, Fragment } from 'preact';
const classNames = require('classnames');

export const NavLink = (props) => {
  const classes = classNames('pl-c-nav__link', {
    [`pl-c-nav__link--level-${props.level}`]: props.level !== undefined,
    'pl-c-nav__link--icon-only': props.iconOnly,
    'pl-c-nav__link--title': props.isTitle,
  });

  const Tag = props.href ? 'a' : 'button';

  return (
    <Tag className={`${classes}`} role="tab" {...props}>
      {props.iconPos === 'before' && props.iconName && (
        <span
          class="pl-c-nav__link-icon"
          dangerouslySetInnerHTML={{
            __html: `<pl-icon name="${props.iconName}"></pl-icon>`,
          }}
        />
      )}
      <span
        className={`pl-c-nav__link-text ${
          props.iconOnly ? 'is-vishidden' : ''
        }`}
      >
        {props.children}
        {props.status && (
          <span
            class={`pl-c-pattern-state pl-c-pattern-state--${props.status}`}
            title={props.status}
          />
        )}
      </span>
      {props.iconPos !== 'before' && props.iconName && (
        <span
          class="pl-c-nav__link-icon"
          dangerouslySetInnerHTML={{
            __html: `<pl-icon name="${props.iconName}"></pl-icon>`,
          }}
        />
      )}
    </Tag>
  );
};
