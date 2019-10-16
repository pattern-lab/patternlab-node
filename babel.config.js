module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    /**
     * 1. Helps with our Web Component Preact renderer
     */
    '@babel/plugin-syntax-jsx' /* [1] */,
    [
      '@babel/plugin-transform-react-jsx' /* [1] */,
      {
        pragma: 'h',
        pragmaFrag: '"span"',
        throwIfNamespace: false,
        useBuiltIns: false,
      },
    ],
  ],
};
