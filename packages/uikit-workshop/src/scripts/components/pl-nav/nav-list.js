/* eslint-disable no-unused-vars, no-shadow */
// this line is required for rendering even if it is note used in the code
import { h, Fragment } from 'preact';
import { NavLink } from './nav-link';

export const NavList = (props) => {
  const { children, category, elem } = props;

  const nonViewAllItems = elem.noViewAll
    ? children.filter((item) => item.patternName !== 'View All')
    : children.filter(
        (item) =>
          item.patternName !== 'View All' && !item.patternName.includes(' Docs')
      );
  const viewAllItems = elem.noViewAll
    ? []
    : children.filter((item) => item.patternName === 'View All');

  return (
    <li className={`pl-c-nav__list-item`}>
      {viewAllItems.length > 0 ? (
        viewAllItems.map((patternSubtypeItem) => (
          <>
            <NavLink
              href={`patterns/${patternSubtypeItem.patternPath}`}
              level={1}
              onClick={(e) =>
                elem.handleClick(e, patternSubtypeItem.patternPartial)
              }
              state={patternSubtypeItem.patternState}
              data-patternpartial={patternSubtypeItem.patternPartial}
            >
              {patternSubtypeItem.patternName === 'View All'
                ? `${category}`
                : patternSubtypeItem.patternName}
            </NavLink>

            {nonViewAllItems.length >= 1 && (
              <NavLink
                iconOnly={true}
                iconName={'arrow-down'}
                aria-controls={category}
                level={1}
                onClick={(e) => elem.iconOnlyPanelToggle(e.target)}
              >
                {category}
              </NavLink>
            )}
          </>
        ))
      ) : (
        <NavLink
          level={2}
          iconName={'arrow-down'}
          aria-controls={category}
          onClick={(e) => elem.panelToggle(e.target)}
        >
          {category}
        </NavLink>
      )}

      {((viewAllItems.length && nonViewAllItems.length) ||
        viewAllItems.length === 0) && (
        <ol
          id={category}
          className={`pl-c-nav__list pl-c-nav__accordion pl-js-nav-accordion`}
        >
          {nonViewAllItems.map((patternSubtypeItem) => (
            <li class="pl-c-nav__list-item">
              <NavLink
                href={`patterns/${patternSubtypeItem.patternPath}`}
                level={2}
                onClick={(e) =>
                  elem.handleClick(e, patternSubtypeItem.patternPartial)
                }
                data-patternpartial={patternSubtypeItem.patternPartial}
                status={patternSubtypeItem.patternState}
              >
                {patternSubtypeItem.patternName === 'View All'
                  ? `${category} Overview`
                  : patternSubtypeItem.patternName}
              </NavLink>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
};
