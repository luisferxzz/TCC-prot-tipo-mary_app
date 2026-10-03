module.exports = function (api) {
  api.cache(true);
  return {
    // No SDK 54 o babel-preset-expo já adiciona o plugin do
    // Reanimated 4 / Worklets automaticamente — listar "plugins"
    // manualmente aqui é desnecessário e pode duplicar o plugin.
    presets: ["babel-preset-expo"],
  };
};
