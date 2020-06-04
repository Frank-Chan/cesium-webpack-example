/* 
//
var Cesium = require('cesium/Cesium');
require('./css/main.css');
require('cesium/Widgets/widgets.css');
 */
import * as Cesium from 'cesium/Cesium.js';
import 'cesium/Widgets/widgets.css';
import './css/main.css';

var viewer = new Cesium.Viewer("cesiumContainer", {
  shouldAnimate: true,
  terrainProvider: Cesium.createWorldTerrain()
});
var planePosition = Cesium.Cartesian3.fromDegrees(114.02800, 22.538042, 500);
var particlesOffset = new Cesium.Cartesian3(0, 0, -100);
var cameraLocation = Cesium.Cartesian3.add(
  planePosition,
  particlesOffset,
  new Cesium.Cartesian3()
);
var resetCamera = function () {
  viewer.camera.lookAt(
    cameraLocation,
    new Cesium.Cartesian3(-450, -300, 200)
  );
};
//resetCamera();

// Draw particle image to a canvas
var particleCanvas;
function getImage() {
  if (!Cesium.defined(particleCanvas)) {
    particleCanvas = document.createElement("canvas");
    particleCanvas.width = 20;
    particleCanvas.height = 20;
    var context2D = particleCanvas.getContext("2d");
    context2D.beginPath();
    context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
    context2D.closePath();
    context2D.fillStyle = "rgb(255, 255, 255)";
    context2D.fill();
  }
  return particleCanvas;
}

// Add plane to scene
var hpr = new Cesium.HeadingPitchRoll(
  0.0,
  Cesium.Math.PI_OVER_TWO,
  0.0
);
var orientation = Cesium.Transforms.headingPitchRollQuaternion(
  planePosition,
  hpr
);
var entity = viewer.entities.add({
  model: {
    uri: "./data/Cesium_Air.glb",
    scale: 6,
  },
  position: planePosition,
  orientation: orientation,
});
setTimeout(() => {//8秒后定位到指定位置和范围
  viewer.flyTo(entity, {
    offset: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-25),
      range: 1000
    }
  });
  /*  viewer.camera.flyTo({
     destination: Cesium.Cartesian3.fromDegrees(114.02800,22.538042,1000),
     orientation: {
       heading: Cesium.Math.toRadians(0.0),
       pitch: Cesium.Math.toRadians(-25.0),
       roll: 0.0
     }
   }); */ 
  // resetCamera();
/*   var planePosition = Cesium.Cartesian3.fromDegrees(114.02800, 22.538042, 500);  
  viewer.camera.lookAt(
    planePosition,
      new Cesium.Cartesian3(-450, -300, 200)
    ); */

}, 8000);

// creating particles model matrix
var translationOffset = Cesium.Matrix4.fromTranslation(
  particlesOffset,
  new Cesium.Matrix4()
);
var translationOfPlane = Cesium.Matrix4.fromTranslation(
  planePosition,
  new Cesium.Matrix4()
);
var particlesModelMatrix = Cesium.Matrix4.multiplyTransformation(
  translationOfPlane,
  translationOffset,
  new Cesium.Matrix4()
);

// creating the particle systems
var rocketOptions = {
  numberOfSystems: 50.0,
  iterationOffset: 0.1,
  cartographicStep: 0.000001,
  baseRadius: 0.0005,

  colorOptions: [
    {
      minimumRed: 1.0,
      green: 0.5,
      minimumBlue: 0.05,
      alpha: 1.0,
    },
    {
      red: 0.9,
      minimumGreen: 0.6,
      minimumBlue: 0.01,
      alpha: 1.0,
    },
    {
      red: 0.8,
      green: 0.05,
      minimumBlue: 0.09,
      alpha: 1.0,
    },
    {
      minimumRed: 1,
      minimumGreen: 0.05,
      blue: 0.09,
      alpha: 1.0,
    },
  ],
};

var cometOptions = {
  numberOfSystems: 100.0,
  iterationOffset: 0.003,
  cartographicStep: 0.0000001,
  baseRadius: 0.0005,

  colorOptions: [
    {
      red: 0.6,
      green: 0.6,
      blue: 0.6,
      alpha: 1.0,
    },
    {
      red: 0.6,
      green: 0.6,
      blue: 0.9,
      alpha: 0.9,
    },
    {
      red: 0.5,
      green: 0.5,
      blue: 0.7,
      alpha: 0.5,
    },
  ],
};

var scratchCartesian3 = new Cesium.Cartesian3();
var scratchCartographic = new Cesium.Cartographic();
var forceFunction = function (options, iteration) {
  return function (particle, dt) {
    dt = Cesium.Math.clamp(dt, 0.0, 0.05);

    scratchCartesian3 = Cesium.Cartesian3.normalize(
      particle.position,
      new Cesium.Cartesian3()
    );
    scratchCartesian3 = Cesium.Cartesian3.multiplyByScalar(
      scratchCartesian3,
      -40.0 * dt,
      scratchCartesian3
    );

    scratchCartesian3 = Cesium.Cartesian3.add(
      particle.position,
      scratchCartesian3,
      scratchCartesian3
    );

    scratchCartographic = Cesium.Cartographic.fromCartesian(
      scratchCartesian3,
      Cesium.Ellipsoid.WGS84,
      scratchCartographic
    );

    var angle =
      (Cesium.Math.PI * 2.0 * iteration) / options.numberOfSystems;
    iteration += options.iterationOffset;
    scratchCartographic.longitude +=
      Math.cos(angle) * options.cartographicStep * 30.0 * dt;
    scratchCartographic.latitude +=
      Math.sin(angle) * options.cartographicStep * 30.0 * dt;

    particle.position = Cesium.Cartographic.toCartesian(
      scratchCartographic
    );
  };
};

var matrix4Scratch = new Cesium.Matrix4();
var scratchAngleForOffset = 0.0;
var scratchOffset = new Cesium.Cartesian3();
var imageSize = new Cesium.Cartesian2(15.0, 15.0);
function createParticleSystems(options, systemsArray) {
  var length = options.numberOfSystems;
  for (var i = 0; i < length; ++i) {
    scratchAngleForOffset =
      (Math.PI * 2.0 * i) / options.numberOfSystems;
    scratchOffset.x +=
      options.baseRadius * Math.cos(scratchAngleForOffset);
    scratchOffset.y +=
      options.baseRadius * Math.sin(scratchAngleForOffset);

    var emitterModelMatrix = Cesium.Matrix4.fromTranslation(
      scratchOffset,
      matrix4Scratch
    );
    var color = Cesium.Color.fromRandom(
      options.colorOptions[i % options.colorOptions.length]
    );
    var force = forceFunction(options, i);

    var item = viewer.scene.primitives.add(
      new Cesium.ParticleSystem({
        image: getImage(),
        startColor: color,
        endColor: color.withAlpha(0.0),
        particleLife: 3.5,
        speed: 0.00005,
        imageSize: imageSize,
        emissionRate: 30.0,
        emitter: new Cesium.CircleEmitter(0.1),
        lifetime: 0.1,
        updateCallback: force,
        modelMatrix: particlesModelMatrix,
        emitterModelMatrix: emitterModelMatrix,
      })
    );
    systemsArray.push(item);
  }
}

var rocketSystems = [];
var cometSystems = [];
createParticleSystems(rocketOptions, rocketSystems);
createParticleSystems(cometOptions, cometSystems);

// toolbar elements
function showAll(systemsArray, show) {
  var length = systemsArray.length;
  for (var i = 0; i < length; ++i) {
    systemsArray[i].show = show;
  }
}
