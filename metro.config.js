// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  assert: require.resolve("empty-module"), // assert can be polyfilled here if needed
  http: require.resolve("empty-module"), // stream-http can be polyfilled here if needed
  https: require.resolve("empty-module"), // https-browserify can be polyfilled here if needed
  os: require.resolve("empty-module"), // os-browserify can be polyfilled here if needed
  url: require.resolve("empty-module"), // url can be polyfilled here if needed
  zlib: require.resolve("empty-module"), // browserify-zlib can be polyfilled here if needed
  path: require.resolve("empty-module"),
  crypto: require.resolve("react-native-quick-crypto"),
  stream: require.resolve("readable-stream"),
  buffer: require.resolve('buffer'),

  // assetExts: assetExts.filter(ext => ext !== 'svg'),

  assetExts: ["svg", "png", "json"],
  sourceExts: ["js", "mjs", "cjs", "jsx", "ts", "tsx"],
  // sourceExts: process.env.TEST_REACT_NATIVE
  //   ? ['e2e.js'].concat(defaultSourceExts)
  //   : defaultSourceExts,
};

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = withNativeWind(config, { input: "./app/global.css" });