import { h } from 'preact';

export const NavToggle = props => {
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
