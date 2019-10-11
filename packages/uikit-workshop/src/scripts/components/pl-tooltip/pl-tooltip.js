import TooltipTrigger from 'react-popper-tooltip';
import { h } from 'preact';
import 'react-popper-tooltip/dist/styles.css';

export const Tooltip = function({ tooltip, children, hideArrow, ...props }) {
  return (
    <TooltipTrigger
      {...props}
      tooltip={({
        getTooltipProps,
        getArrowProps,
        tooltipRef,
        arrowRef,
        placement,
      }) => (
        <div
          {...getTooltipProps({
            ref: tooltipRef,
            className: 'tooltip-container',
          })}
        >
          {!hideArrow && (
            <div
              {...getArrowProps({
                ref: arrowRef,
                'data-placement': placement,
                className: 'tooltip-arrow',
              })}
            />
          )}
          {tooltip}
        </div>
      )}
    >
      {children}
    </TooltipTrigger>
  );
};
