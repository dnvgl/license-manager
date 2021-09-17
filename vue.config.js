module.exports = {
  pages: {
    index: {
      entry: "src/main.js",
      title: "License Activation Tool",
    },
  },
  transpileDependencies: [
    "bootstrap-vue",
    "@dnvgl-onefoundation/onedesign-vue",
  ],
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(node)$/,
          parser: { amd: false },
          use: {
            loader: "@vercel/webpack-asset-relocator-loader",
            options: {
              outputAssetBase: "native_modules",
            },
          },
        },
      ],
    },
  },
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js",
      externals: ["keytar"],
      builderOptions: {
        generateUpdatesFilesForAllChannels: true,
        publish: ["github"],
        productName: "License Activation Tool",
      },
    },
  },
};
