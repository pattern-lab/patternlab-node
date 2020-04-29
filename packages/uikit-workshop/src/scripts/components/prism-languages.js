import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-twig';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-css-extras';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-handlebars';

if (!Prism.languages.hasOwnProperty('hbs')) {
  // hbs doesn't exist initially
  Prism.languages.hbs = Prism.languages.handlebars;
}

export const PrismLanguages = Prism;
