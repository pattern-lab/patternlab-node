/*------------------------------------*\
    #PRIMARY NAVIGATION
\*------------------------------------*/
/**
 * Toggles active class on the primary nav item
 * 1) Select all nav dropdown triggers and cycle through them
 * 2) On click, find the nav dropdown trigger parent
 * 3) If the nav dropdown trigger parent already has active class, remove it.
 * 4) If the nav dropdown trigger parent does not have an active class, add it.
 */
(function () {
  var navLink = document.querySelectorAll('.js_nav-dropdown-trigger'); /* 1 */

  for (i = 0; i < navLink.length; i++) {
    /* 1 */

    navLink[i].addEventListener('click', function (event) {
      /* 2 */ event.preventDefault();
      var navLinkParent = this.parentNode; /* 2 */

      if (navLinkParent.classList.contains('is-active')) {
        /* 3 */
        navLinkParent.classList.remove('is-active');
      } else {
        /* 4 */
        navLinkParent.classList.add('is-active');
      }
    });
  }

  /**
   * Toggles active class on the primary nav panel
   * 1) Select all nav triggers and cycle through them
   * 2) On click, find the nav panel within the header
   * 3) If the navPanel already has active class, remove it on click.
   * 4) If the navPanel does not have an active class, add it on click.
   */
  var navToggle = document.querySelectorAll('.js-nav-trigger'); /* 1 */

  for (i = 0; i < navToggle.length; i++) {
    /* 1 */

    navToggle[i].addEventListener('click', function (event) {
      /* 2 */ event.preventDefault();
      var navToggleParent = this.parentNode; /* 2 */
      var navPanel = navToggleParent.querySelector('.js-nav-panel'); /* 2 */

      if (navPanel.classList.contains('is-active')) {
        /* 3 */
        navPanel.classList.remove('is-active');
      } else {
        /* 4 */
        navPanel.classList.add('is-active');
      }
    });
  }
})();
