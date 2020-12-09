module.exports = function (api) {
    api.env();

    api.cache(true);

    const config = {
        presets: [
            "@babel/preset-env",
            "@babel/preset-react"
        ],
        plugins: [
            "@babel/plugin-proposal-class-properties"
        ]
    };

    return config;
};
