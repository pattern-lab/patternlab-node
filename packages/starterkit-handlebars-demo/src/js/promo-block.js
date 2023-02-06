(function () {
  const promoBlocks = document.querySelectorAll('.c-promo-block__body');

  // Set things up.
  window.addEventListener(
    'load',
    function (event) {
      createObserver();
    },
    false
  );

  function createObserver() {
    var observer;

    var options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    observer = new IntersectionObserver(handleIntersect, options);

    promoBlocks.forEach((promoBlock) => {
      promoBlock.classList.add('c-promo-block__body--initial');

      observer.observe(promoBlock);
    });
  }

  function handleIntersect(entries, observer) {
    entries.forEach(function (entry) {
      if (entry.intersectionRatio > 0) {
        entry.target.classList.remove('c-promo-block__body--initial');
        observer.unobserve(entry.target);
      }
    });
  }
})();
