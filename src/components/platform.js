define([  "engine/observe",
          "engine/graphics",
          "engine/component", "engine/schedule", 
          "text!shaders/screen-coordinates.frag", "text!shaders/screen-coordinates.vert",
          "engine/hud", "engine/beats"], 
  function(Observe, Graphics, Component, Schedule, SCRN_COORDS_FRAG_SRC, SCRN_COORDS_VERT_SRC, HUD, Beats){

  var mat4 = CubicVR.mat4;

  var datguiFolder = HUD.datgui.addFolder("Platform");

  var __datguiModel = {"uYFactor":16.400000000000002,"uYOffset":-0.07};

  var __datguiView = {
    uYFactor: datguiFolder.add(__datguiModel, 'uYFactor', -20, 20).step(0.1),
    uYOffset: datguiFolder.add(__datguiModel, 'uYOffset', -3, 3).step(0.01),
  };

  datguiFolder.add({
    bam: function(){
      console.log(JSON.stringify(__datguiModel));
    }
  }, 'bam');

  for(var prop in __datguiModel){
    if(__datguiModel.hasOwnProperty(prop)){
      (function(p){__datguiView[p].onChange(function(value){
        __datguiView.observe.notify(p, value);
      })}(prop));
    }
  }

  Observe(__datguiView);

  var __sideMaterial, __topMaterial;

  var __uv;

  Graphics.observe.subscribe("ready", function(){
    __uv = new CubicVR.UVMapper({
      projectionMode: "cubic",
      scale: [1, 1, 1],
      center: [0, 0, 0]
    });

    var screenCoordsShader = new CubicVR.CustomShader({
      vertex: SCRN_COORDS_VERT_SRC,
      fragment: SCRN_COORDS_FRAG_SRC,
      init: function(shader){
        if(shader.uShadowIndex) shader.uShadowIndex.set(0);
        if(shader.uAudio)screenCoordsShader.uAudio0.set(0);
        for(var prop in __datguiModel){
          if(__datguiModel.hasOwnProperty(prop)){
            shader[prop].set(__datguiModel[prop]);            
          }
        }
      }
    });

    var __shadowIndex = 0;

    for(var prop in __datguiModel){
      if(__datguiModel.hasOwnProperty(prop)){
        (function(p){__datguiView.observe.subscribe(p, function(e){
          screenCoordsShader[p].set(e.data);
        })}(prop));
      }
    }

    Schedule.event.add("update", function(e){
      if(screenCoordsShader.ready()){
        __shadowIndex += e.data.dt/1000;
        if(screenCoordsShader.uShadowIndex)screenCoordsShader.uShadowIndex.set(__shadowIndex);
       
        var buf = Beats.spectrum;

        //console.log(buf[0]);

        if(screenCoordsShader.uAudio0)screenCoordsShader.uAudio0.set(buf[0]*10);
        if(screenCoordsShader.uAudio1)screenCoordsShader.uAudio1.set(buf[5]*10);
        if(screenCoordsShader.uAudio2)screenCoordsShader.uAudio2.set(buf[12]*10);
        if(screenCoordsShader.uAudio3)screenCoordsShader.uAudio3.set(buf[24]*10);
        if(screenCoordsShader.uAudio4)screenCoordsShader.uAudio4.set(buf[31]*10);


      }
    });

    __sideMaterial = new CubicVR.Material({
      shader: screenCoordsShader
    });

    __topMaterial = new CubicVR.Material({
      color: [0.7, 0.7, 0.7]
    })
  });

  return Component("platform", function(setupOptions){
    
    setupOptions = setupOptions || {};

    var _this = this;

    var mesh = new CubicVR.Mesh();
    var size = setupOptions.size || [0.5, 0.5, 0.5];
    var halfSize = [
      size[0]/2,
      size[1]/2,
      size[2]/2
    ];

    mesh.addPoint([
      [halfSize[0], -halfSize[1], halfSize[2]],
      [halfSize[0], halfSize[1], halfSize[2]],
      [-halfSize[0], halfSize[1], halfSize[2]],
      [-halfSize[0], -halfSize[1], halfSize[2]],
      [halfSize[0], -halfSize[1], -halfSize[2]],
      [halfSize[0], halfSize[1], -halfSize[2]],
      [-halfSize[0], halfSize[1], -halfSize[2]],
      [-halfSize[0], -halfSize[1], -halfSize[2]]
    ]);

    mesh.addFace([
      [0, 1, 2, 3],
      [7, 6, 5, 4],
      [4, 5, 1, 0],
      [5, 6, 2, 1],
      [6, 7, 3, 2],
      [7, 4, 0, 3]
    ]);

    var _shadowIndex = 0;
    
    mesh.setFaceMaterial(__sideMaterial);
    mesh.calcFaceNormals();
    __uv.apply(mesh, __sideMaterial);
    mesh.setFaceMaterial(__topMaterial, 3);
    mesh.prepare();

    var _sceneObject = _this.sceneObject = new CubicVR.SceneObject(mesh);

    _this.event.add("entity-changed", function(e){
      var entity = e.data;
      entity.sceneObject.bindChild(_sceneObject);
    });

  });

});
