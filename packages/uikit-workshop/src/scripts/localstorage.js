export const saveState = state => {
  const json = localStorage.getItem('patternlab') || '{}';
  const stringifiedNewState = JSON.stringify(state);

  if (stringifiedNewState !== json && stringifiedNewState !== '{}') {
    localStorage.setItem('patternlab', stringifiedNewState);
  }
};

export const loadState = () => {
  let json;

  // Temporarily don't load the cached state in debug mode.
  if (window.location.hash === '#debug') {
    json = '{}';
    // Alternatively, clear the localStorage redux state with a #reset hash
  } else if (window.location.hash === '#reset') {
    localStorage.removeItem('patternlab');
    json = {};
  } else {
    json = localStorage.getItem('patternlab') || '{}';
  }

  const state = JSON.parse(json);

  if (state) {
    // Add default state data here (if necessary)
    if (state.app) {
      if (state.app.drawerHeight && !state.app.drawerOpened) {
        state.app.appHeight = window.innerHeight;
      } else if (state.app.drawerHeight && state.app.drawerOpened) {
        state.app.appHeight = window.innerHeight - state.app.drawerHeight;
      }
    }

    if (state.app) {
      if (state.app.themeMode === undefined) {
        try {
          if (window.patternlab.config.theme.color !== undefined) {
            state.app.themeMode = window.patternlab.config.theme.color;
          }
        } catch (e) {
          state.app.themeMode = 'dark';
        }
      }
    }

    return state;
  } else {
    return undefined;
  }
};
