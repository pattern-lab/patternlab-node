import { define, props } from 'skatejs';
import { h } from 'preact';
import { store } from '../../store.js'; // redux store
import {
  updateDrawerState,
  updateDrawerHeight,
  updateDrawerAnimationState,
  // updateAppHeight,
  // updateViewportHeight,
} from '../../actions/app.js'; // redux actions needed by this element.
import { css } from '../../utils';
import { BaseComponent } from '../base-component.js';
import AnimateHeight from 'react-animate-height';

@define
export class Drawer extends BaseComponent {
  static is = 'pl-drawer';

  constructor(self) {
    self = super(self);
    this.onMouseDown = this.onMouseDown.bind(this); // fix bindings so "this" works properly
    this.onMouseUp = this.onMouseUp.bind(this); // fix bindings so "this" works properly
    this.onMouseMove = this.onMouseMove.bind(this); // fix bindings so "this" works properly
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

  get renderRoot() {
    return this;
  }

  render({ drawerOpened, drawerHeight, isViewallPage }) {
    const classes = css(
      'pl-c-drawer',
      'pl-js-drawer',
      drawerOpened && !isViewallPage ? 'pl-is-active' : ''
    );

    const height =
      drawerOpened && !isViewallPage
        ? drawerHeight > 20 ? drawerHeight : 300
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
                {/* <pl-toggle-layout ></pl-toggle-layout> @todo: look into why this isn't re-rendering correctly */}
                <button
                  class="pl-c-drawer__close-btn"
                  title="Hide pattern info"
                  title="Menu"
                  onClick={_ => store.dispatch(updateDrawerState(false))}
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    class="pl-c-drawer__close-btn-icon"
                  >
                    <title>Close Drawer</title>
                    <path
                      fill="currentColor"
                      d="M11.8905,9.6405 L11.8905,9.6405 L8.25,6 L11.8905,2.3595 L11.8905,2.3595 C11.9295,2.3205 11.958,2.27475 11.976,2.226 C12.0255,2.0925 11.997,1.9365 11.8905,1.82925 L10.17075,0.1095 C10.0635,0.00225 9.9075,-0.02625 9.774,0.024 C9.72525,0.042 9.6795,0.0705 9.6405,0.1095 L9.6405,0.1095 L6,3.75 L2.3595,0.1095 L2.3595,0.1095 C2.3205,0.0705 2.27475,0.042 2.226,0.024 C2.0925,-0.0255 1.9365,0.00225 1.82925,0.1095 L0.1095,1.82925 C0.00225,1.9365 -0.02625,2.0925 0.024,2.226 C0.042,2.27475 0.0705,2.3205 0.1095,2.3595 L0.1095,2.3595 L3.75,6 L0.1095,9.6405 L0.1095,9.6405 C0.0705,9.6795 0.042,9.72525 0.024,9.774 C-0.0255,9.9075 0.00225,10.0635 0.1095,10.17075 L1.82925,11.8905 C1.9365,11.99775 2.0925,12.02625 2.226,11.976 C2.27475,11.958 2.3205,11.9295 2.3595,11.8905 L2.3595,11.8905 L6,8.25 L9.6405,11.8905 L9.6405,11.8905 C9.6795,11.9295 9.72525,11.958 9.774,11.976 C9.9075,12.0255 10.0635,11.99775 10.17075,11.8905 L11.8905,10.17075 C11.99775,10.0635 12.02625,9.9075 11.976,9.774 C11.958,9.72525 11.9295,9.6795 11.8905,9.6405 L11.8905,9.6405 Z"
                    />
                  </svg>
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
