function hasShadowDomSupport() {
  if (
    ('attachShadow' in Element.prototype &&
      'getRootNode' in Element.prototype) ||
    window.ShadyDOM
  ) {
    return true;
  } else {
    return false;
  }
}

export const supportsShadowDom = hasShadowDomSupport();
