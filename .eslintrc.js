module.exports = {
  root: true,
  extends: [
    "airbnb-base",
    "plugin:json/recommended",
    "plugin:xwalk/recommended",
  ],
  env: {
    browser: true,
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: "module",
    requireConfigFile: false,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react"],
  rules: {
    "import/extensions": ["error", { js: "always", jsx: "always" }], // require js and jsx file extensions in imports
    "linebreak-style": ["error", "unix"], // enforce unix linebreaks
    "no-param-reassign": [2, { props: false }], // allow modifying properties of param
  },
};
