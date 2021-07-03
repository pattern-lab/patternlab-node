import { h } from 'preact';
import { NavToggle } from './NavToggle';
import { NavLink } from './NavLink';
import { NavItem } from './NavItem';
import { NavButton } from './NavButton';
import { getRandom } from '../../../utils';

export const NavList = (props) => {
  const { children, category, categoryName, elem } = props;
  const reorderedChildren = [];

  const random = getRandom(10000000, 99999999);

  const nonViewAllItems = elem.noViewAll
    ? children.filter((item) => !item.isDocPattern)
    : children.filter(
        (item) => !item.isDocPattern && !item.patternName.includes(' Docs')
      );
  const viewAllItems = elem.noViewAll
    ? []
    : children.filter((item) => item.isDocPattern);

  reorderedChildren.push(...viewAllItems, ...nonViewAllItems);

  return (
    <NavItem className={`pl-c-nav__item--${category.toLowerCase()}`}>
      {viewAllItems.length > 0 ? (
        viewAllItems.map((patternSubgroupItem) => (
          <div class="pl-c-nav__link--overview-wrapper">
            <NavLink
              category={category}
              categoryName={categoryName}
              item={patternSubgroupItem}
              elem={elem}
            />

            {nonViewAllItems.length >= 1 && (
              <NavToggle
                aria-controls={`${category}-${random}`}
                onClick={elem.toggleSpecialNavPanel}
              >
                Expand / Collapse {category} Panel
              </NavToggle>
            )}
          </div>
        ))
      ) : (
        <NavButton
          aria-controls={`${category}-${random}`}
          onClick={elem.toggleNavPanel}
        >
          {categoryName}
        </NavButton>
      )}

      {((viewAllItems.length && nonViewAllItems.length) ||
        viewAllItems.length === 0) && (
        <ol
          id={`${category}-${random}`}
          className={`pl-c-nav__subsublist pl-c-nav__subsublist--dropdown pl-js-acc-panel`}
        >
          {nonViewAllItems.map((patternSubgroupItem) => (
            <NavItem>
              <NavLink
                category={category}
                categoryName={categoryName}
                item={patternSubgroupItem}
                elem={elem}
              />
            </NavItem>
          ))}
        </ol>
      )}
    </NavItem>
  );
};
