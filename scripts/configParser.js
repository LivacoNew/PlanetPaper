planetPaper.configParser = {};

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        planetPaper.debugLog("Parsing Config...");

        if(properties.showPos != null) {
            planetPaper.cache.config.showPos = properties.showPos.value;
        }

        // if(!planetPaper.cache.config.showPos || !planetPaper.running) {
        // }
        if(properties.cameraAlpha != null) {
            planetPaper.cache.config.cameraAlpha = properties.cameraAlpha.value;
        }
        if(properties.cameraBeta != null) {
            planetPaper.cache.config.cameraBeta = properties.cameraBeta.value;
        }

        if(properties.enablePlanet != null) {
            planetPaper.cache.config.planetEnabled = properties.enablePlanet.value;
        }

        if(properties.enablePlanet || planetPaper.cache.config.planetEnabled) {
            if(properties.planet != null) {
                planetPaper.cache.config.planet = properties.planet.value;
            }
            if(properties.axialTilt != null) {
                planetPaper.cache.config.renderTilt = properties.axialTilt.value
            }
            if(properties.renderAtmosphere != null) {
                planetPaper.cache.config.renderAtmosphere = properties.renderAtmosphere.value
            }
            if(properties.renderClouds != null) {
                planetPaper.cache.config.renderClouds = properties.renderClouds.value
            }
            if(properties.renderRings != null) {
                planetPaper.cache.config.renderRings = properties.renderRings.value
            }
        }

        if(properties.showPos == null) {
            if(planetPaper.cache.config.showPos && planetPaper.running) {
                return;
            }
        }
        planetPaper.postConfigLoad();
    }
}