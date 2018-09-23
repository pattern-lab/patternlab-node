import { define, props } from 'skatejs';
import { h } from 'preact';
import Fuse from 'fuse.js';
import ReactHtmlParser from 'react-html-parser';
import classNames from 'classnames';
import Mousetrap from 'mousetrap';

import VisuallyHidden from '@reach/visually-hidden';
import ReactAutocomplete from 'react-autocomplete';

import { urlHandler } from '../../utils';
import { BaseComponent } from '../base-component';

@define
class Search extends BaseComponent {
  static is = 'pl-search';

  constructor(self) {
    self = super(self);
    this.useShadow = false;
    this.defaultMaxResults = 10;

    this.state = {
      isOpen: false,
      value: '',
    };

    this.receiveIframeMessage = this.receiveIframeMessage.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.closeSearch = this.closeSearch.bind(this);
    this.openSearch = this.openSearch.bind(this);

    this.data = [];
    for (const patternType in window.patternPaths) {
      if (window.patternPaths.hasOwnProperty(patternType)) {
        for (const pattern in window.patternPaths[patternType]) {
          if (window.patternPaths[patternType].hasOwnProperty(pattern)) {
            const obj = {};
            obj.label = patternType + '-' + pattern;
            obj.id = window.patternPaths[patternType][pattern];
            this.data.push(obj);
          }
        }
      }
    }

    return self;
  }

  connected() {
    const self = this;
    Mousetrap.bind('command+f', function(e) {
      e.preventDefault();
      self.toggleSearch();
    });
    window.addEventListener('message', this.receiveIframeMessage, false);
  }

  rendered() {
    this.inputElement = this.input;
  }

  static props = {
    maxResults: props.string,
    placeholder: props.string,
    showClearButton: props.boolean,
    clearButtonText: props.string,
  };

  // External Redux store not yet in use
  _stateChanged(state) {}

  // update the iframe via the history api handler
  passPath(item) {
    this.setState({ value: item });
    this.closeSearch();
    const obj = JSON.stringify({
      event: 'patternLab.updatePath',
      path: urlHandler.getFileName(item),
    });
    document
      .querySelector('.pl-js-iframe')
      .contentWindow.postMessage(obj, urlHandler.targetOrigin);
  }

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

  receiveIframeMessage(event) {
    // does the origin sending the message match the current host? if not dev/null the request
    if (
      window.location.protocol !== 'file:' &&
      event.origin !== window.location.protocol + '//' + window.location.host
    ) {
      return;
    }

    let data = {};
    try {
      data =
        typeof event.data !== 'string' ? event.data : JSON.parse(event.data);
    } catch (e) {
      // @todo: how do we want to handle exceptions here?
    }

    if (data.event !== undefined && data.event === 'patternLab.keyPress') {
      if (data.key === 'f' && data.metaKey === true) {
        this.toggleSearch();
      }
    }
  }

  // highlights keywords in the search results in a react-friendly way + limits total number / max displayed
  filterAndLimitResults() {
    const data = this.data;

    const maxResults = this.props.maxResults
      ? this.props.maxResults
      : this.defaultMaxResults;

    const fuseOptions = {
      shouldSort: true,
      threshold: 0.3,
      tokenize: true,
      includeMatches: true,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['label'],
    };
    const fuse = new Fuse(data, fuseOptions);
    const results = fuse.search(this.state.value ? this.state.value : '');

    const highlighter = function(item) {
      const resultItem = item;
      resultItem.matches.forEach(matchItem => {
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
          resultItem.children.forEach(child => {
            highlighter(child);
          });
        }
      });
    };

    results.forEach(resultItem => {
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

  render() {
    const open = this.state.isOpen;
    const currentValue = this.state.value;
    const shouldShowClearButton = this.props.showClearButton
      ? this.props.showClearButton
      : true;

    const clearButtonText = this.props.clearButtonText
      ? this.props.clearButtonText
      : 'Clear Search Results';

    return (
      <div className={'pl-c-typeahead-wrapper'}>
        <ReactAutocomplete
          items={this.filterAndLimitResults()}
          ref={el => (this.input = el)}
          wrapperProps={{
            className: classNames('pl-c-typeahead'),
          }}
          //setting autoHighlight to false seems to help prevent an occasional JS error from firing (relating to the dom-scroll-into-view library)
          autoHighlight={false}
          onMenuVisibilityChange={isOpen => this.setState({ isOpen })}
          getItemValue={item => item.label}
          renderItem={(item, highlighted) => (
            <div
              className={classNames('pl-c-typeahead__result', {
                [`pl-has-cursor`]: highlighted,
              })}
              key={item.id}
            >
              {item.highlightedLabel}
            </div>
          )}
          inputProps={{
            className: classNames('pl-c-typeahead__input', {
              [`pl-c-typeahead__input--with-clear-button`]: shouldShowClearButton,
            }),
            placeholder: this.props.placeholder
              ? this.props.placeholder
              : 'Find a Pattern',
          }}
          renderMenu={(items, value, style) => (
            <div
              className={classNames('pl-c-typeahead__menu', {
                [`pl-is-open`]: open,
              })}
            >
              <div
                className={'pl-c-typeahead__results'}
                style={{ ...style, ...this.menuStyle }}
                children={items}
              />
            </div>
          )}
          value={this.state.value}
          onChange={e => {
            e.target.value !== '' && e.target.value !== undefined
              ? this.setState({ value: e.target.value })
              : this.setState({ value: '' });
          }}
          onSelect={value => this.passPath(value)}
        />
        {shouldShowClearButton && (
          <button
            className={classNames('pl-c-typeahead__clear-button', {
              [`pl-is-visible`]: currentValue !== '',
            })}
            onClick={() => {
              this.clearSearch();
            }}
          >
            <VisuallyHidden>{clearButtonText}</VisuallyHidden>
            <svg
              viewBox="0 0 16 16"
              height="16"
              width="16"
              className={'pl-c-typeahead__clear-button-icon'}
            >
              <title>Clear Search Results</title>
              <path d="M12.207 10.793l-1.414 1.414-2.793-2.793-2.793 2.793-1.414-1.414 2.793-2.793-2.793-2.793 1.414-1.414 2.793 2.793 2.793-2.793 1.414 1.414-2.793 2.793 2.793 2.793z" />
            </svg>
          </button>
        )}
      </div>
    );
  }
}

export { Search };
