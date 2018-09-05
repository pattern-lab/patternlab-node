/**
 * Default languages for Prism to match rendering capability
 */

export const PrismLanguages = {
  languages: [],

  get(key) {
    let language;

    for (let i = 0; i < this.languages.length; ++i) {
      language = this.languages[i];
      if (language[key] !== undefined) {
        return language[key];
      }
    }

    return 'markup';
  },

  add(language) {
    // see if the language already exists, overwrite if it does
    for (const key in language) {
      if (language.hasOwnProperty(key)) {
        for (let i = 0; i < this.languages.length; ++i) {
          if (this.languages[i][key] !== undefined) {
            this.languages[i][key] = language[key];
            return;
          }
        }
      }
    }

    this.languages.push(language);
  },
};

// this shouldn't get hardcoded, also need to think about including Prism's real lang libraries (e.g. handlebars & twig)
PrismLanguages.add({
  twig: 'markup',
});

PrismLanguages.add({
  mustache: 'markup',
});
