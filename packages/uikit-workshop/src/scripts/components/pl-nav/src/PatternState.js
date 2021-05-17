import { h } from 'preact';

export const PatternState = (props) => {
  return (
    <span
      class={`pl-c-pattern-state pl-c-pattern-state--${props.variant}`}
      title={props.variant}
    />
  );
};
