import { define, props } from 'skatejs';
import { h } from 'preact';

import { store } from '../../store.js'; // redux store
import {
  updateDrawerState,
  updateDrawerHeight,
  updateDrawerAnimationState,
} from '../../actions/app.js'; // redux actions needed by this element.
import { css } from '../../utils';
import { BaseComponent } from '../base-component.js';
import AnimateHeight from 'react-animate-height';
import CloseIcon from '../../../icons/close.svg';

@define
export class Drawer extends BaseComponent {
  static is = 'pl-drawer';

  constructor(self) {
    self = super(self);
    self.onMouseDown = self.onMouseDown.bind(self); // fix bindings so "self" works properly
    self.onMouseUp = self.onMouseUp.bind(self); // fix bindings so "self" works properly
    self.onMouseMove = self.onMouseMove.bind(self); // fix bindings so "this" works properly
    self.useShadow = false;
    return self;
  }

  state = {
    isMouseDown: false,
    isMouseUp: false,
    isDragging: false,
    hasDragged: false,
    panelHeight: '50vh',
  };

  onMouseDown() {
    this.setState({
      ...this.state,
      isMouseDown: true,
    });

    store.dispatch(updateDrawerAnimationState(true));

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  onMouseMove(event) {
    // 1/2 the height of the UI being dragged. @todo: make sure this 7px is calculated
    const clientHeight = event.targetTouches
      ? event.targetTouches[0].clientY
      : event.clientY;
    const panelHeight = window.innerHeight - clientHeight + 7;

    store.dispatch(updateDrawerHeight(panelHeight));

    this.setState({
      ...this.state,
      isDragging: true,
      panelHeight: `${panelHeight}px`,
    });
  }

  onMouseUp() {
    this.setState({
      ...this.state,
      hasDragged: this.state.isDragging,
      isDragging: false,
      isMouseDown: false,
      isMouseUp: true,
    });

    store.dispatch(updateDrawerAnimationState(false));

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  static props = {
    drawerOpened: props.boolean,
  };

  render({ drawerOpened, drawerHeight, isViewallPage }) {
    const classes = css(
      'pl-c-drawer',
      'pl-js-drawer',
      drawerOpened && !isViewallPage ? 'pl-is-active' : ''
    );

    const height =
      drawerOpened && !isViewallPage
        ? drawerHeight > 20
          ? drawerHeight
          : 300
        : 0;

    return (
      <div>
        <div
          class="pl-c-drawer__cover"
          style={this.state.isMouseDown ? 'display: block;' : 'display: none;'}
        />
        <AnimateHeight
          duration={this.state.isMouseDown ? 0 : 300}
          height={height}
          className="pl-c-drawer__wrapper"
        >
          <div className={classes}>
            <div class="pl-c-drawer__toolbar">
              <div
                class="pl-c-drawer__resizer"
                onMouseDown={this.onMouseDown}
              />
              <div class="pl-c-drawer__toolbar-controls">
                {/* <pl-toggle-layout></pl-toggle-layout> */}

                <button
                  class="pl-c-drawer__close-btn"
                  title="Hide pattern info"
                  title="Menu"
                  onClick={_ => store.dispatch(updateDrawerState(false))}
                >
                  <CloseIcon
                    width={20}
                    height={20}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className={'pl-c-drawer__close-btn-icon'}
                  />
                </button>
              </div>
            </div>
            <div class="pl-c-drawer__content pl-js-drawer-content" />
          </div>
        </AnimateHeight>
      </div>
    );
  }

  _stateChanged(state) {
    this.drawerOpened = state.app.drawerOpened;
    this.drawerHeight = state.app.drawerHeight;
    this.isDragging = state.app.isDragging;
    this.isViewallPage = state.app.isViewallPage;
  }
}
