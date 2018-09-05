/**
 * Panels Util - for both styleguide and viewer
 */

export const panelsUtil = {
  /**
   * Add click events to the template that was rendered
   * @param  {String}      the rendered template for the modal
   * @param  {String}      the pattern partial for the modal
   */
  addClickEvents(templateRendered, patternPartial) {
    const els = templateRendered.querySelectorAll('.pl-js-tab-link');
    for (let i = 0; i < els.length; ++i) {
      els[i].onclick = function(e) {
        e.preventDefault();

        const partial = this.getAttribute('data-patternpartial');
        const panelID = this.getAttribute('data-panelid');
        panelsUtil.show(partial, panelID);
      };
    }

    return templateRendered;
  },

  /**
   * Show a specific modal
   * @param  {String}      the pattern partial for the modal
   * @param  {String}      the ID of the panel to be shown
   */
  show(patternPartial, panelID) {
    const activeTabClass = 'pl-is-active-tab';

    // turn off all of the active tabs
    const allTabLinks = document.querySelectorAll(`.pl-js-tab-link`);

    // hide all of the panels
    const allTabPanels = document.querySelectorAll(`.pl-js-tab-panel`);

    // tabLink about to become active
    const activeTabLink = document.querySelector(
      `#pl-${patternPartial}-${panelID}-tab`
    );

    // tabPanelabout to become active
    const activeTabPanel = document.querySelector(
      `#pl-${patternPartial}-${panelID}-panel`
    );

    for (let i = 0; i < allTabLinks.length; ++i) {
      allTabLinks[i].classList.remove(activeTabClass);
    }

    for (let i = 0; i < allTabPanels.length; ++i) {
      allTabPanels[i].classList.remove(activeTabClass);
    }

    activeTabLink.classList.add(activeTabClass);
    activeTabPanel.classList.add(activeTabClass);
  },
};
