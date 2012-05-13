window.dump = window.dump || function(){};

require([ "engine/schedule", "engine/hud",
          "engine/graphics", "engine/scene",
          "entities/player",
          "engine/loader",
          "engine/beats",
          "entities/plane",
          "engine/level",
          "engine/game-logic",
          "entities/platform",
          "engine/debug-canvas"
        ], 
        function( Schedule, HUD, Graphics, Scene, 
                  PlayerEntity, Loader, Beats, PlaneEntity,
                  Level, GameLogic, PlatformEntity, DebugCanvas){

  Loader.lock();

  var cameraSpeedDistance = 0.2;

  DebugCanvas.SetEnabled(false);

  function createTestScene(){
    var scene = new Scene();

    // Start beathelper
    Beats.play("assets/audio/track.ogg");

    var playerEntity = new PlayerEntity({
      position: [0, 10, 0],
      rotation: [0, 180, 0],
    });
    playerEntity.coins = 0;
    playerEntity.addCoins = function(c) {
      playerEntity.coins += c;
      document.getElementById("coins").innerHTML = playerEntity.coins;
    }

    GameLogic.AddGameObject(playerEntity);
    scene.add(playerEntity);

    var plane = new PlaneEntity({
      size: 10,
      families : ["plane"]
    }, playerEntity);
    GameLogic.AddGameObject(plane);
    scene.add(plane);

    GameLogic.EachFrame("Player").push( function(p, elapsedTime) {
      DebugCanvas.Clear();
      var everyBody = GameLogic.gameObjects.all;
      for(var o = 0; o<everyBody.length; ++o) {
        DebugCanvas.DrawBox(everyBody[o].aabb);
      }
    });

    GameLogic.EachFrame("beats-z-beat").push( function(b,elapsedTime) {
      if (!Beats.lastBeat)
        return;
      b.sceneObject.position[2] = b.original_z + (new Date().getTime() - Beats.lastBeat)/500;
    });
    
    GameLogic.EachFrame("beats-z-spect").push( function(b,elapsedTime) {
      b.sceneObject.position[2] = b.original_z + 10*Beats.spectrumMax;
    });
    
    GameLogic.OnBoxCollision("Monster", "Player").push(function(m, p, e){
      p.hurt();
    });

    GameLogic.OnBoxCollision("Player", "collectable").push(function(p, c, e){
      c.collectedBy(p);
      p.addCoins(1);
    });

    var testLight = new CubicVR.Light({
      type: "area",
      intensity: 0.9,
      mapRes: 2048,  // 4096 ? 8192 ? ;)
      areaCeiling: 40,
      areaFloor: -40,
      areaAxis: [25,5] // specified in degrees east/west north/south
    });
    
    scene.cubicvr.bind(testLight);

    var level = new Level({
      // Where the levle starts in space
      levelOrigin: [-20, 0, 0],
      // How long the level is
      goalAtY: 600,
    });

    // Transform the setup options into platforms entity
    // and add them to the scene.
    level.buildToScene(scene);

    GameLogic.AddGameObject(playerEntity);

    scene.cubicvr.camera.target = [0, 0, 0];
    scene.cubicvr.camera.position = [0, 8, 25];
    scene.cubicvr.camera.setFOV(45);

    scene.cubicvr.setSkyBox(new CubicVR.SkyBox({texture: "assets/images/8bit-sky.jpg"}));

    CubicVR.setGlobalAmbient([0.3,0.3,0.3]);


    var cameraIndex = 0;

    var firstFrame = true;

    Schedule.event.add("intro-complete", function(e){
      Schedule.event.add("update", function(e){
        var dx = e.data.dt / 300;
        //scene.cubicvr.camera.position[0] += dx;
        //scene.cubicvr.camera.target[0] += dx;
        //scene.cubicvr.camera.target = [playerEntity.position[0],9, 0];
        //scene.cubicvr.camera.position = [playerEntity.position[0], 14, 15];  
        var p = GameLogic.GetFamily("Player")[0];

        var cameraY = scene.cubicvr.camera.target[1];

        scene.cubicvr.camera.position = [
          p.sceneObject.position[0] + cameraSpeedDistance*10, 
          14.5,
          10 + cameraSpeedDistance*70
        ];
        
        scene.cubicvr.camera.target = [
          p.sceneObject.position[0] + cameraSpeedDistance*23, 
          cameraY - (cameraY - playerEntity.sceneObject.position[1])*0.08,
          0
        ];

        //pointLight.position[0] += dx;
        //playerEntity.move(dx);
        if(!firstFrame){
          GameLogic.DoOneFrame();
        }
        firstFrame = false;
      });
    });
    
    return scene;
  }

  // Start graphics subsystem
  Graphics.setup({
    success: function(){
      HUD.showBigMessage("Loading...");
      var mainScene = createTestScene();
      Schedule.event.add("intro-complete", function(e){
        Graphics.addScene(mainScene);
      });
      Schedule.start();
      Loader.unlock(function(){
        HUD.hideBigMessage();
      });
    },
    failure: function(){
      HUD.showBigMessage("Startup Error: Please make sure your browser is WebGL-capable.");
    }
  });

});
