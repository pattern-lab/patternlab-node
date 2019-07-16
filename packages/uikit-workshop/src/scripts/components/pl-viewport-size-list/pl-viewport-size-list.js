import { h } from 'preact';

export const ViewportSizeList = ishControlsHide => {
  return (
    <ul class="pl-c-size-list">
      {!ishControlsHide.s && (
        <li class="pl-c-size-list__item">
          <button class="pl-c-size-list__action" id="pl-size-s">
            S
          </button>
        </li>
      )}
      {!ishControlsHide.m && (
        <li class="pl-c-size-list__item">
          <button class="pl-c-size-list__action" id="pl-size-m">
            M
          </button>
        </li>
      )}
      {!ishControlsHide.l && (
        <li class="pl-c-size-list__item">
          <button class="pl-c-size-list__action" id="pl-size-l">
            L
          </button>
        </li>
      )}
      {!ishControlsHide.full && (
        <li class="pl-c-size-list__item">
          <button class="pl-c-size-list__action" id="pl-size-full">
            Full
          </button>
        </li>
      )}
      {!ishControlsHide.random && (
        <li class="pl-c-size-list__item">
          <button class="pl-c-size-list__action" id="pl-size-random">
            Rand
          </button>
        </li>
      )}
      {!ishControlsHide.disco && (
        <li class="pl-c-size-list__item">
          <button class="pl-c-size-list__action mode-link" id="pl-size-disco">
            Disco
          </button>
        </li>
      )}
      {!ishControlsHide.hay && (
        <li class="pl-c-size-list__item">
          <button class="pl-c-size-list__action mode-link" id="pl-size-hay">
            Hay!
          </button>
        </li>
      )}
    </ul>
  );
};
