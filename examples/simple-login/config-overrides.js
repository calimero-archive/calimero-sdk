module.exports = function override (config, env) {
    console.log('override')
    let loaders = config.resolve
    loaders.fallback = {
        "fs": false,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify")
    }
    
    return config
}