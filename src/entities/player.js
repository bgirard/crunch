define(["engine/entity", "components/sprite", "engine/loader", "text!sprites/player.json"], 
  function(Entity, SpriteComponent, Loader, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  return function(setupOptions){

    setupOptions = setupOptions || {};



    var entity = new Entity({
      name: "player",
      components: [
        new SpriteComponent({
          size: setupOptions.size,
          sprite: SPRITE_JSON
        }),
      ],
      families: setupOptions.families,
      collisionPoints: setupOptions.collisionPoints,
      speed: setupOptions.speed,
      position: setupOptions.position,
      rotation: setupOptions.rotation, 
    });

    entity.setAnimation = function(animName) {
      entity.components["sprite"].currentAnimation = animName;
    }

    Loader.load(Loader.Image(SPRITE_JSON.resource), function(image){
      entity.components["sprite"].compile({
        color: image,
      });
    });

    return entity;

  };

});
