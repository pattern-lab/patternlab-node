import { h } from 'preact';

export const ViewportSize = props => {
  return (
    <form className="pl-c-viewport-size" method="post" action="#">
      <input
        type="text"
        className="pl-c-viewport-size__input"
        id="pl-size-px"
        value={props.px}
        readonly
      />
      <label for="pl-size-px" className="pl-c-viewport-size__label">
        px /
      </label>
      <input
        type="text"
        className="pl-c-viewport-size__input"
        id="pl-size-em"
        value={props.em}
        readonly
      />
      <label for="pl-size-em" className="pl-c-viewport-size__label">
        em
      </label>
    </form>
  );
};
