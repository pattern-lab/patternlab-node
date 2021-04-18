import { h } from 'preact';
import cx from 'classnames';

export const NavItem = (props) => {
  const classes = cx('pl-c-nav__item', props.className);

  return <li className={classes}>{props.children}</li>;
};
