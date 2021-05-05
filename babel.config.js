module.exports = function (api) {
  api.env();

  api.cache(true);

  const config = {
    presets: ['@babel/preset-react', '@babel/preset-env'],
    plugins: ['@babel/plugin-proposal-class-properties'],
  };

  return config;
};
