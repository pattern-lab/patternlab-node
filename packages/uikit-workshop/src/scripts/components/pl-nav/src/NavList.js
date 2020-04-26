import { h } from 'preact';
import { NavToggle } from './NavToggle';
import { NavLink } from './NavLink';
import { NavItem } from './NavItem';
import { NavButton } from './NavButton';

export const NavList = props => {
  const { children, category, elem } = props;
  const reorderedChildren = [];

  const nonViewAllItems = elem.noViewAll
    ? children.filter(item => item.patternName !== 'View All')
    : children.filter(
        item =>
          item.patternName !== 'View All' && !item.patternName.includes(' Docs')
      );
  const viewAllItems = elem.noViewAll
    ? []
    : children.filter(item => item.patternName === 'View All');

  reorderedChildren.push(...viewAllItems, ...nonViewAllItems);

  return (
    <NavItem className={`pl-c-nav__item--${category.toLowerCase()}`}>
      {viewAllItems.length > 0 ? (
        viewAllItems.map(patternSubtypeItem => (
          <div class="pl-c-nav__link--overview-wrapper">
            <NavLink
              category={category}
              item={patternSubtypeItem}
              elem={elem}
            />

            {nonViewAllItems.length >= 1 && (
              <NavToggle
                aria-controls={category}
                onClick={elem.toggleSpecialNavPanel}
              >
                {category}
              </NavToggle>
            )}
          </div>
        ))
      ) : (
        <NavButton aria-controls={category} onClick={elem.toggleNavPanel}>
          {category}
        </NavButton>
      )}

      {((viewAllItems.length && nonViewAllItems.length) ||
        viewAllItems.length === 0) && (
        <ol
          id={category}
          className={`pl-c-nav__subsublist pl-c-nav__subsublist--dropdown pl-js-acc-panel`}
        >
          {nonViewAllItems.map(patternSubtypeItem => (
            <NavItem>
              <NavLink
                category={category}
                item={patternSubtypeItem}
                elem={elem}
              />
            </NavItem>
          ))}
        </ol>
      )}
    </NavItem>
  );
};
