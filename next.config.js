module.exports = (phase, { defaultConfig }) =>  {
    return {
        ...defaultConfig,
        webpack: (config, options) => {
            const existingExternals = config.externals === undefined ? [] : config.externals;
            config = { ...config, externals: [  { leaflet: 'L' }, ...existingExternals, ] };
            return config;
        }
    }
};
