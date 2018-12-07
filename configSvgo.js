exports.config = {
  plugins: [
    {
      removeUselessDefs: true
    },
    {
      removeTitle: true
    },
    {
      removeDoctype: true
    },
    {
      removeComments: true
    },
    {
      removeMetadata: true
    },
    {
      removeDesc: true
    },
    {
      removeEmptyAttrs: true
    },
    {
      removeHiddenElems: true
    },
    {
      removeEmptyText: true
    },
    {
      removeEmptyContainers: true
    },
    {
      minifyStyles: true
    },
    {
      removeUnknownsAndDefaults: true
    },
    {
      cleanupIDs: true
    },
    ,
    {
      removeStyleElement: true
    },
    {
      removeAttrs: { attrs: "(id|class|data-name|data-old_color|data-original)" }
    },
    {
      removeViewBox: false
    }
  ]
};
