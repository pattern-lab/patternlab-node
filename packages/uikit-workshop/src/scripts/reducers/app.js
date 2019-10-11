import {
  UPDATE_DRAWER_STATE,
  UPDATE_DRAWER_HEIGHT,
  UPDATE_DRAWER_ANIMATION_STATE,
  UPDATE_LAYOUT_MODE,
  UPDATE_VIEWPORT_PX,
  UPDATE_VIEWPORT_EM,
  UPDATE_THEME_MODE,
  IS_VIEWALL_PAGE,
  UPDATE_CURRENT_URL,
  UPDATE_CURRENT_PATTERN,
} from '../actions/app.js';

const app = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_LAYOUT_MODE:
      return {
        ...state,
        layoutMode: action.layoutMode,
      };
    case UPDATE_CURRENT_URL:
      return {
        ...state,
        currentUrl: action.currentUrl,
      };
    case UPDATE_CURRENT_PATTERN:
      return {
        ...state,
        currentPattern: action.currentPattern,
      };
    case UPDATE_VIEWPORT_PX:
      return {
        ...state,
        viewportPx: action.viewportPx,
      };
    case UPDATE_VIEWPORT_EM:
      return {
        ...state,
        viewportEm: action.viewportEm,
      };
    case UPDATE_THEME_MODE:
      return {
        ...state,
        themeMode: action.themeMode,
      };
    case UPDATE_DRAWER_STATE:
      return {
        ...state,
        drawerOpened: action.opened,
      };
    case UPDATE_DRAWER_HEIGHT:
      return {
        ...state,
        drawerHeight: action.height,
      };
    case UPDATE_DRAWER_ANIMATION_STATE:
      return {
        ...state,
        drawerIsAnimating: action.drawerIsAnimating,
      };
    case IS_VIEWALL_PAGE:
      return {
        ...state,
        isViewallPage: action.isViewall,
      };
    default:
      return state;
  }
};

export default app;
