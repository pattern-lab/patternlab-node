import { h } from 'preact';

export const NavButton = (props) => {
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
          __html: '<pl-icon name="arrow-down" aria-hidden="true"></pl-icon>',
        }}
      />
    </button>
  );
};
