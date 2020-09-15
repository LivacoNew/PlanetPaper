var planetPaper = {};
planetPaper.author = "Livaco";
planetPaper.version = "0.0.1 BETA";
planetPaper.inProduction = true;
planetPaper.debugMode = false;
planetPaper.running = false;

planetPaper.cache = {};
planetPaper.cache.config = [];

planetPaper.load = function() {
    // Grab Planets
    planetPaper.cachePlanetConfigs();

    if(!planetPaper.debugMode && !planetPaper.cache.config.showPos) {
        document.getElementById("debug").style.display = "none";
    }
}
planetPaper.postConfigLoad = function() {
    planetPaper.debugLog("CAll");
    planetPaper.debugLog(planetPaper.renderer.renderCache.scene);
    if(planetPaper.renderer.renderCache.scene == null) return;
    planetPaper.debugLog("Scene reloading...");

    planetPaper.renderer.renderCache.scene.registerBeforeRender(function() {
        planetPaper.renderer.renderCache.scene.dispose();

        planetPaper.renderer.setup();
    });

    planetPaper.running = true;
}
planetPaper.postCacheLoad = function() {
    // Setup renderer.
    planetPaper.renderer.setup();
    return;
}

planetPaper.debugLog = function(str) {
    if(!planetPaper.debugMode) return;
    document.getElementById("debug").innerHTML += str;
    console.log(" " + str + " ");
}

planetPaper.cachePlanetConfigs = function() {
    // https://api.livaco.dev/wallpaper_media/planetpaper/g.json
    $.getJSON("config.json", function(data) {
        // planetPaper.debugLog(JSON.stringify(data));
        planetPaper.cache.planetConfigs = data;

        planetPaper.postCacheLoad();
    }).fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        planetPaper.debugLog( "Request Failed: " + err );
    });
}

// Thanks https://stackoverflow.com/a/11508164/12071005
planetPaper.hexToRgb = function(hex) {
    hex = hex.replace("#", "");
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return {r: r, g: g, b: b};
}