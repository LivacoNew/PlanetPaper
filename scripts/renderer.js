planetPaper.renderer = {};

planetPaper.renderer.renderCache = {};

planetPaper.renderer.setup = function() {
    planetPaper.renderer.renderCache = {};

    planetPaper.renderer.renderCache.canvas = document.getElementById("mainCanvas");
    planetPaper.renderer.renderCache.engine = new BABYLON.Engine(planetPaper.renderer.renderCache.canvas, true);

    planetPaper.renderer.refreshCanvasSize();

    planetPaper.renderer.renderCache.scene = planetPaper.renderer.createScene(planetPaper.renderer.renderCache.engine, planetPaper.renderer.renderCache.canvas);
    planetPaper.renderer.setupScene(planetPaper.renderer.renderCache.scene);

    planetPaper.renderer.renderCache.engine.runRenderLoop(function() {
        planetPaper.renderer.renderCache.scene.render();
    });
}

planetPaper.renderer.refreshCanvasSize = function() {
    planetPaper.renderer.renderCache.canvas.width = window.innerWidth;
    planetPaper.renderer.renderCache.canvas.height = window.innerHeight;
}

window.addEventListener("resize", function() {
    planetPaper.renderer.refreshCanvasSize();
    planetPaper.renderer.renderCache.engine.resize();
})

planetPaper.renderer.setupScene = function(scene) {
    // TODO: Skybox, Gas Giants, Rings

    if(planetPaper.cache.config.planetEnabled) {
        planetPaper.debugLog("Attempting to load planet id: " + planetPaper.cache.config.planet);
        var config = planetPaper.cache.planetConfigs[planetPaper.cache.config.planet];
        planetPaper.debugLog("Display Name: " + config.displayName);

        var planetBase = BABYLON.MeshBuilder.CreateSphere(
            "planet",
            { diameter: 2 },
            scene
        );

        // Materials, this is the important stuff
        var rendering = config.physicalProperties.rendering;

        // Diffuse/Bump/Specular
        planetBase.material = new BABYLON.StandardMaterial("planetBase", scene);

        if(rendering.diffuse != null) {
            planetBase.material.diffuseTexture = new BABYLON.Texture(rendering.diffuse, scene);
            planetBase.material.diffuseTexture.vScale = -1;
            planetBase.material.diffuseTexture.uScale = -1;
        }
        if(rendering.normals != null) {
            planetBase.material.bumpTexture = new BABYLON.Texture(rendering.normals, scene)
            planetBase.material.bumpTexture.vScale = -1;
            planetBase.material.bumpTexture.uScale = -1;
        }
        if(rendering.specular != null) {
            planetBase.material.specularTexture = new BABYLON.Texture(rendering.specular, scene)
            planetBase.material.specularTexture.vScale = -1;
            planetBase.material.specularTexture.uScale = -1;

            planetBase.material.useGlossinessFromSpecularMapAlpha = true;
            planetBase.material.useReflectionFresnelFromSpecular = true;
        }

        if(rendering.atmosphere != null && planetPaper.cache.config.renderAtmosphere) {
            var atmo = rendering.atmosphere;
            var atmoHeight = 2.01;

            if(atmo.clouds != null && planetPaper.cache.config.renderClouds) {
                atmo.clouds.layers.forEach(function(item, index) {
                // var index = 3;
                // var item = atmo.clouds.layers[index];
                    // Clouds

                    atmoHeight += 0.01;
                    var clouds = BABYLON.MeshBuilder.CreateSphere(
                        "cloud_layer_" + index,
                        { diameter: atmoHeight },
                        scene
                    );

                    clouds.material = new BABYLON.StandardMaterial("planetCloudLayer" + index, scene);
                    clouds.material.diffuseTexture = new BABYLON.Texture(item.map, scene);
                    clouds.material.diffuseTexture.vScale = -1;
                    clouds.material.diffuseTexture.uScale = -1;
                    clouds.material.diffuseTexture.hasAlpha = true;
                    clouds.material.backFaceCulling = true;
                    clouds.material.alpha = item.opacity;

                    clouds.material.specularTexture = new BABYLON.Texture("textures/SpecularBlank.png", scene)
                    clouds.material.specularTexture.vScale = -1;
                    clouds.material.specularTexture.uScale = -1;

                    clouds.material.useGlossinessFromSpecularMapAlpha = true;
                    clouds.material.useReflectionFresnelFromSpecular = true;

                    if(planetPaper.cache.config.renderTilt) {
                        clouds.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), config.physicalProperties.tilt * (Math.PI / 180));
                    }
                    clouds.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), Math.PI / Math.ceil(Math.random() * 300));

                    var rotationAxis = new BABYLON.Vector3(0, 1, 0);
                    scene.registerAfterRender(function() {
                        clouds.rotate(rotationAxis, item.rotationSpeed / 1000, BABYLON.Space.LOCAL);
                    });
                });
            }

            // Atmosphere
            var atmosphere = BABYLON.MeshBuilder.CreateSphere(
                "atmosphere",
                { diameter: atmoHeight + 0.025 },
                scene
            );

            atmosphere.material = new BABYLON.StandardMaterial("planetAtmo", scene);

            var rgb = planetPaper.hexToRgb(atmo.color);
            atmosphere.material.diffuseColor = new BABYLON.Color3(rgb.r / 255, rgb.g / 255, rgb.b / 255);
            atmosphere.material.alpha = atmo.opacity;

            atmosphere.material.specularTexture = new BABYLON.Texture("textures/SpecularBlank.png", scene)

            atmosphere.material.useGlossinessFromSpecularMapAlpha = true;
            atmosphere.material.useReflectionFresnelFromSpecular = true;
        }
        if(rendering.ring != null && planetPaper.cache.config.renderRings) {
            var ringPlane = new BABYLON.MeshBuilder.CreatePlane(
                "ring",
                {height: 5, width: 5, sideOrientation: BABYLON.Mesh.DOUBLESIDE},
                scene
            );

            ringPlane.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(1, 0, 0), 1.5708);
            if(planetPaper.cache.config.renderTilt) {
                ringPlane.rotate(new BABYLON.Vector3(0, 0, 1), config.physicalProperties.tilt * (Math.PI / 180), BABYLON.Space.WORLD);
            }

            ringPlane.material = new BABYLON.StandardMaterial("rings", scene);
            ringPlane.material.diffuseTexture = new BABYLON.Texture(rendering.ring.map, scene);
            ringPlane.material.diffuseTexture.hasAlpha = true;
            ringPlane.material.useAlphaFromDiffuseTexture = true;
            ringPlane.material.alpha = rendering.ring.opacity;

            ringPlane.material.specularTexture = new BABYLON.Texture("textures/SpecularBlank.png", scene)

            // light that bad boi
            var top = new BABYLON.DirectionalLight(
                "top",
                new BABYLON.Vector3(1, -1, 0),
                scene
            );
            top.intensity = 0.5;

            var bottom = new BABYLON.DirectionalLight(
                "bottom",
                new BABYLON.Vector3(1, 1, 0),
                scene
            );
            bottom.intensity = 0.5;

            top.excludedMeshes.push(planetBase)
            bottom.excludedMeshes.push(planetBase)

            // This is really shit....
            if(rendering.atmosphere != null) {
                top.excludedMeshes.push(atmosphere)
                bottom.excludedMeshes.push(atmosphere)
                if(rendering.atmosphere.clouds != null) {

                    for(i = 0; i < rendering.atmosphere.clouds.layers.length; i++) {
                        top.excludedMeshes.push("cloud_layer_" + i)
                        bottom.excludedMeshes.push("cloud_layer_" + i)
                    }
                }
            }
        }

        // Rotations
        if(planetPaper.cache.config.renderTilt) {
            planetBase.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), config.physicalProperties.tilt * (Math.PI / 180));
        }

        if(config.physicalProperties.rotates) {
            var rotationAxis = new BABYLON.Vector3(0, 1, 0);
            scene.registerAfterRender(function() {
                planetBase.rotate(rotationAxis, config.physicalProperties.rotationSpeed / 1000, BABYLON.Space.LOCAL);
            });
        }
    }

    // TODO: Fix
    // var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    // var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    // skyboxMaterial.backFaceCulling = false;
    // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
    // skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    // skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    // skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    // skybox.material = skyboxMaterial;

    if(planetPaper.cache.config.showPos) {
        document.getElementById("debug").style.display = "block";
        setInterval(function() {
            document.getElementById("debug").innerHTML = "Horizontal Rotation: " + planetPaper.renderer.renderCache.camera.alpha.toFixed(5) + " - Vertical Rotation: " + planetPaper.renderer.renderCache.camera.beta.toFixed(5);
            document.getElementById("debug").innerHTML += "<br>To use these, align the camera to the way you want it, then take these two values and input them into your Wallpaper Engine settings. The scene will not update while this mode is active so remember to disable it.";
        }, 100)
    } else if(!planetPaper.debugMode) {
        document.getElementById("debug").style.display = "none";
    }

    return scene;
}

planetPaper.renderer.createScene = function(engine, canvas) {
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    planetPaper.renderer.renderCache.camera = new BABYLON.ArcRotateCamera(
        "Camera",
        3 * Math.PI / 2,
        Math.PI / 8,
        5,
        BABYLON.Vector3.Zero(),
        scene
    );
    if(planetPaper.cache.config.showPos) {
        planetPaper.renderer.renderCache.camera.attachControl(canvas, true);
    }
    planetPaper.renderer.renderCache.camera.lowerRadiusLimit = 6;
    planetPaper.renderer.renderCache.camera.upperRadiusLimit = 20;
    planetPaper.renderer.renderCache.camera.useAutoRotationBehaviour = true;
    planetPaper.renderer.renderCache.camera.alpha = planetPaper.cache.config.cameraAlpha;
    planetPaper.renderer.renderCache.camera.beta = planetPaper.cache.config.cameraBeta;

    var front = new BABYLON.DirectionalLight(
        "front",
        new BABYLON.Vector3(1, 0, 0),
        scene
    );
    front.intensity = 1;

    // var back = new BABYLON.DirectionalLight(
    //     "back",
    //     new BABYLON.Vector3(-1, 0, 0),
    //     scene
    // );
    // back.intensity = 0.1;

    return scene;
}