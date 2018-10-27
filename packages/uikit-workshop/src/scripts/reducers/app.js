import { UPDATE_LAYOUT_MODE, UPDATE_THEME_MODE } from '../actions/app.js';

const app = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_LAYOUT_MODE:
      return {
        ...state,
        layoutMode: action.layoutMode,
      };
    case UPDATE_THEME_MODE:
      return {
        ...state,
        themeMode: action.themeMode,
      };
    default:
      return state;
  }
};

export default app;
