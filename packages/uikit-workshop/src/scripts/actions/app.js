export const UPDATE_THEME_MODE = 'UPDATE_THEME_MODE';
export const UPDATE_LAYOUT_MODE = 'UPDATE_LAYOUT_MODE';

export const updateLayoutMode = layoutMode => (dispatch, getState) => {
  if (getState().app.layoutMode !== layoutMode) {
    dispatch({
      type: UPDATE_LAYOUT_MODE,
      layoutMode,
    });
  }
};

export const updateThemeMode = themeMode => (dispatch, getState) => {
  if (getState().app.themeMode !== themeMode) {
    dispatch({
      type: UPDATE_THEME_MODE,
      themeMode,
    });
  }
};
