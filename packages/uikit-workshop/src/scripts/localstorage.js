export const saveState = (state) => {
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
    if (!state.app) {
      state.app = {};
    }

    if (!window.__PRERENDER_INJECTED) {
      if (state.app.drawerOpened === undefined) {
        state.app.drawerOpened = window.config.defaultShowPatternInfo || false;
      }
    }

    if (state.app.drawerHeight && !state.app.drawerOpened) {
      state.app.appHeight = window.innerHeight;
    } else if (state.app.drawerHeight && state.app.drawerOpened) {
      state.app.appHeight = window.innerHeight - state.app.drawerHeight;
    }

    if (state.app.themeMode === undefined) {
      try {
        if (window.config.theme.color !== undefined) {
          state.app.themeMode = window.config.theme.color;
        }
      } catch (e) {
        state.app.themeMode = 'dark';
      }
    }

    if (state.app.layoutMode === undefined) {
      try {
        if (window.config.theme.layout !== undefined) {
          state.app.layoutMode = window.config.theme.layout;
        }
      } catch (e) {
        state.app.layoutMode = 'vertical';
      }
    }

    return state;
  } else {
    return undefined;
  }
};
