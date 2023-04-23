/* eslint-disable no-unused-vars, no-param-reassign */
import { define, props } from 'skatejs';
import { h } from 'preact';
import { store } from '../../store.js'; // connect to redux

import Fuse from 'fuse.js';
import ReactHtmlParser from 'react-html-parser';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';
import Autosuggest from 'react-autosuggest';

import { urlHandler, iframeMsgDataExtraction } from '../../utils';
import { BaseComponent } from '../base-component';

@define
class Search extends BaseComponent {
  static is = 'pl-search';

  constructor() {
    super();
    this.useShadow = false;
    this.defaultMaxResults = 10;

    // Autosuggest is a controlled component.
    // This means that you need to provide an input value
    // and an onChange handler that updates this value (see below).
    // Suggestions also need to be provided to the Autosuggest,
    // and they are initially empty because the Autosuggest is closed.
    this.state = {
      value: '',
      suggestions: [],
      isFocused: false,
    };

    this.receiveIframeMessage = this.receiveIframeMessage.bind(this);
    this.onChange = this.onChange.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.renderInputComponent = this.renderInputComponent.bind(this);
    this.openSearch = this.openSearch.bind(this);
  }

  connecting() {
    super.connecting && super.connecting();

    this.items = [];
    for (const patternGroup in window.patternPaths) {
      if (window.patternPaths.hasOwnProperty(patternGroup)) {
        for (const pattern in window.patternPaths[patternGroup]) {
          if (window.patternPaths[patternGroup].hasOwnProperty(pattern)) {
            const obj = {};
            obj.label = patternGroup + '-' + pattern;
            obj.id = window.patternPaths[patternGroup][pattern];
            this.items.push(obj);
          }
        }
      }
    }
  }

  connected() {
    Mousetrap.bind('command+shift+f', function (e) {
      e.preventDefault();
      this.toggleSearch();
    });
    window.addEventListener('message', this.receiveIframeMessage, false);
  }

  _stateChanged(state) {
    // throw new Error('_stateChanged() not implemented', this);
    this.triggerUpdate();
  }

  rendered() {
    this.inputElement = this.querySelector('.js-c-typeahead__input');
  }

  static props = {
    maxResults: props.string,
    placeholder: props.string,
    hideClearButton: props.boolean,
    clearButtonText: props.string,
  };

  onInput = (e) => {
    const value = e.target.value;

    this.setState({
      value: value,
    });

    this.onSuggestionsFetchRequested({ value }); // re-render search results immediately based on latest input value
  };

  toggleSearch() {
    if (!this.state.isOpen) {
      this.openSearch();
    } else {
      this.closeSearch();
    }
  }

  clearSearch() {
    this.inputElement.focus();
    this.setState({
      value: '',
    });
  }

  openSearch() {
    this.inputElement.focus();
  }

  closeSearch() {
    document.activeElement.blur();
  }

  /**
   *
   * @param {MessageEvent} e A message received by a target object.
   */
  receiveIframeMessage(e) {
    const data = iframeMsgDataExtraction(e);

    if (data.event !== undefined && data.event === 'patternLab.keyPress') {
      if (data.key === 'f' && data.metaKey === true) {
        this.toggleSearch();
      }
    }
  }

  getSuggestionValue = (suggestion) => suggestion.label;

  renderSuggestion(item, { query, isHighlighted }) {
    return <span>{item.highlightedLabel}</span>;
  }

  // highlights keywords in the search results in a react-friendly way + limits total number / max displayed
  getSuggestions(value) {
    const maxResults = this.props.maxResults
      ? this.props.maxResults
      : this.defaultMaxResults;

    const fuseOptions = {
      shouldSort: true,
      threshold: 0.3,
      includeMatches: true,
      location: 0,
      distance: 100,
      minMatchCharLength: 1,
      keys: ['label'],
    };
    const fuse = new Fuse(this.items, fuseOptions);
    const results = fuse.search(value);

    const highlighter = function (item) {
      const resultItem = item;
      resultItem.matches.forEach((matchItem) => {
        const text = resultItem.item[matchItem.key];
        const result = [];
        const matches = [].concat(matchItem.indices);
        let pair = matches.shift();

        for (let i = 0; i < text.length; i++) {
          const char = text.charAt(i);
          if (pair && i === pair[0]) {
            result.push('<strong>');
          }
          result.push(char);
          if (pair && i === pair[1]) {
            result.push('</strong>');
            pair = matches.shift();
          }
        }
        resultItem.item.highlightedLabel = result.join('');

        resultItem.item.highlightedLabel = ReactHtmlParser(
          resultItem.item.highlightedLabel
        );

        if (resultItem.children && resultItem.children.length > 0) {
          resultItem.children.forEach((child) => {
            highlighter(child);
          });
        }
      });
    };

    results.forEach((resultItem) => {
      highlighter(resultItem);
    });

    const reducedResults = results.reduce((total, result) => {
      total.push(result.item);
      return total;
    }, []);

    if (reducedResults.length < maxResults) {
      return reducedResults;
    } else {
      return reducedResults.slice(0, maxResults);
    }
  }

  // Autosuggest calls this when a search result is selected
  onChange = (event, { newValue }) => {
    const patternName = urlHandler.getFileName(newValue);

    if (patternName) {
      document.querySelector('pl-iframe').navigateTo(newValue);
    }

    this.setState({
      value: newValue,
    });
  };

  // Autosuggest calls this every time you need to update suggestions.
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({ isOpen: true });

    this.setState({
      suggestions: this.getSuggestions(value),
    });
  };

  renderInputComponent(inputProps) {
    const { value } = this.state;

    const shouldShowClearButton =
      this.props.hideClearButton !== undefined &&
      this.props.hideClearButton !== true &&
      value !== '';

    const clearButtonText = this.props.clearButtonText
      ? this.props.clearButtonText
      : 'Clear Search Results';

    return (
      <div
        className={classNames('pl-c-typeahead__input-wrapper', {
          [`pl-c-typeahead__input-wrapper--with-clear-button`]:
            shouldShowClearButton,
        })}
      >
        <input {...inputProps} />
        {shouldShowClearButton && (
          <button
            className={classNames('pl-c-typeahead__clear-button', {
              [`pl-is-visible`]: value !== '',
            })}
            onClick={() => {
              this.clearSearch();
            }}
            type="button"
          >
            <span class="is-vishidden">{clearButtonText}</span>
            <svg
              viewBox="0 0 16 16"
              height="16"
              width="16"
              className={'pl-c-typeahead__clear-button-icon'}
            >
              <title>{clearButtonText}</title>
              <path d="M12.207 10.793l-1.414 1.414-2.793-2.793-2.793 2.793-1.414-1.414 2.793-2.793-2.793-2.793 1.414-1.414 2.793 2.793 2.793-2.793 1.414 1.414-2.793 2.793 2.793 2.793z" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Autosuggest calls this every time you need to clear suggestions.
  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });

    this.setState({ isOpen: false });
  };

  onSuggestionSelected() {
    this.setState({ isOpen: false });
  }

  render() {
    const { value, suggestions } = this.state;

    const shouldShowClearButton =
      this.props.hideClearButton !== undefined &&
      this.props.hideClearButton !== true &&
      value !== '';

    // no CSS for these Autosuggest selectors yet -- not yet needed
    const theme = {
      container: classNames('pl-c-typeahead'),
      containerOpen: classNames('pl-c-typeahead--open'),
      input: classNames('pl-c-typeahead__input', 'js-c-typeahead__input', {
        [`pl-c-typeahead__input--with-clear-button`]: shouldShowClearButton,
      }),
      inputOpen: classNames('pl-c-typeahead__input--open'),
      inputFocused: classNames('pl-c-typeahead__input--focused'),
      suggestionsContainer: classNames('pl-c-typeahead__menu'),
      suggestionsContainerOpen: classNames('pl-is-open'),
      suggestionsList: classNames('pl-c-typeahead__results'),
      suggestion: classNames('pl-c-typeahead__result'),
      suggestionFirst: classNames('pl-c-typeahead__result--first'),
      suggestionHighlighted: classNames('pl-has-cursor'),
      sectionContainer: classNames(
        'pl-c-typeahead__section-container'
      ) /* [1] */,
      sectionContainerFirst: classNames(
        'pl-c-typeahead__section-container--first'
      ) /* [1] */,
      sectionTitle: classNames('pl-c-typeahead__section-title') /* [1] */,
    };

    // Autosuggest will pass through all these props to the input.
    const inputProps = {
      placeholder: this.props.placeholder
        ? this.props.placeholder
        : 'Find a Pattern',
      value,
      onChange: this.onChange,
      onInput: this.onInput,
    };

    return (
      <div>
        <Autosuggest
          theme={theme}
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
          renderInputComponent={this.renderInputComponent}
        />
      </div>
    );
  }
}

export { Search };
