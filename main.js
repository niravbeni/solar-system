//import libraries
import * as THREE from "three";
import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";
import { GUI } from "dat.gui";

//progress bar
var manager = new THREE.LoadingManager();
const progressBar = document.getElementById("progress-bar");
manager.onProgress = function (item, loaded, total) {
  progressBar.value = (loaded / total) * 100;
};
const progressBarContainer = document.querySelector(".progress-bar-container");
manager.onLoad = function () {
  progressBarContainer.style.display = "none";
};

//declare variables
let camera, scene, renderer, labelRenderer;

//create scene
scene = new THREE.Scene();

//window dimensions
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio,
};
const aspectRatio = sizes.width / sizes.height;

//camera setup
camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 10000);
camera.position.set(-100, 80, 250);
scene.add(camera);

//general render setup
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
document.body.appendChild(renderer.domElement);

//label render setup
labelRenderer = new CSS2DRenderer({ antialias: true });
labelRenderer.setSize(sizes.width, sizes.height);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0px";
document.body.appendChild(labelRenderer.domElement);

//orbit control
const controls = new OrbitControls(camera, labelRenderer.domElement);
controls.minDistance = 20;
controls.maxDistance = 20000;
controls.enableDamping = true;
controls.enablePan = true;
controls.update;

//light setup
const ambientLight = new THREE.AmbientLight(0x333333);
const pointLight = new THREE.PointLight(0xffffff, 5, 400);
scene.add(ambientLight, pointLight);

//relative dimensions
const dim = {
  sunSize: 15,
  mercuryDist: 25,
  earthRot: 0.05,
  earthRev: 0.005,
  slowRate: 1,
};

//mouse event
window.addEventListener("mousedown", function (e) {
  const xWindow = sizes.width - gui.__ul.clientWidth - 25;
  const yWindow = gui.__ul.clientHeight + 25;
  if (e.clientX < xWindow || e.clientY > yWindow) {
    dim.slowRate = 0.2;
    sunLabelDiv.style.opacity = 1;
    orbitsOn();
    planetsLabelOn();

    if (
      planetChecklist.mercury ||
      planetChecklist.venus ||
      planetChecklist.earth ||
      planetChecklist.mars ||
      planetChecklist.jupiter ||
      planetChecklist.saturn ||
      planetChecklist.uranus ||
      planetChecklist.neptune == true
    ) {
      altPlanetsLabelOn();
    }
  }
});
window.addEventListener(
  "mouseup",
  () => (
    (dim.slowRate = 1),
    (sunLabelDiv.style.opacity = 0),
    orbitsOff(),
    planetsLabelOff(),
    altPlanetsLabelOff()
  )
);

//star mesh
const starGeometry = new THREE.BufferGeometry();
const starCount = 500000;
const positionArray = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  positionArray[i] = (Math.random() - 0.5) * 40000;
}
starGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positionArray, 3)
);
const starMaterial = new THREE.PointsMaterial({ size: 0.005 });
const star = new THREE.Points(starGeometry, starMaterial);
scene.add(star);

//sun mesh
const sunGeometry = new THREE.SphereGeometry(dim.sunSize, 64, 64);
const sunTexture = new THREE.TextureLoader(manager).load("sun.jpg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

//suns atmosphere
const sunAtmosGeometry = new THREE.SphereGeometry(dim.sunSize + 0.1, 64, 64);
const sunAtmosMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
  transparent: true,
  opacity: 0.2,
});
const sunAtmos = new THREE.Mesh(sunAtmosGeometry, sunAtmosMaterial);
scene.add(sunAtmos);

//sun label
const sunCentre = new THREE.Object3D();
const sunLabelDiv = document.createElement("div");
sunLabelDiv.className = "label";
sunLabelDiv.textContent = "Sun";
sunLabelDiv.style.backgroundColor = "transparent";
sunLabelDiv.style.opacity = 0;
const label = new CSS2DObject(sunLabelDiv);
label.position.set(dim.sunSize / 1.5, dim.sunSize / 1.1, 0);
label.center.set(0, 1);
sunCentre.add(label);
scene.add(sunCentre);

//orbit function
function generateOrbit(radius) {
  const orbitPoints = new THREE.Path()
    .absarc(0, 0, radius, 0, 2 * Math.PI)
    .getPoints(500);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
  });
  const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);
  return { mesh: orbit, material: orbitMaterial };
}

//generate orbits
const mercuryOrbit = generateOrbit(1 * dim.mercuryDist);
const venusOrbit = generateOrbit(1.9 * dim.mercuryDist);
const earthOrbit = generateOrbit(2.6 * dim.mercuryDist);
const marsOrbit = generateOrbit(4 * dim.mercuryDist);
const jupiterOrbit = generateOrbit(5.5 * dim.mercuryDist);
const saturnOrbit = generateOrbit(7.2 * dim.mercuryDist);
const uranusOrbit = generateOrbit(8.4 * dim.mercuryDist);
const neptuneOrbit = generateOrbit(9.9 * dim.mercuryDist);
orbitsOff();

//planet function
function generatePlanet(name, size, position, image, alt, ring) {
  const geometry = new THREE.SphereGeometry(size, 30, 30);
  const texture = new THREE.TextureLoader(manager).load(image);
  var material = 0;
  var ringMaterial = 0;
  var labelDiv = 0;
  if (!alt) {
    var material = new THREE.MeshPhongMaterial({ map: texture });
  } else {
    var material = new THREE.MeshBasicMaterial({ map: texture });
  }
  var mesh = new THREE.Mesh(geometry, material);
  const object = new THREE.Object3D();
  var ringmesh = 0;
  if (ring) {
    const ringTexture = new THREE.TextureLoader(manager).load(ring.texture);
    const ringGeometry = new THREE.RingGeometry(
      ring.innerRadius,
      ring.outerRadius,
      32
    );
    if (!alt) {
      var ringMaterial = new THREE.MeshStandardMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
      });
    } else {
      var ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
      });
    }
    var ringmesh = new THREE.Mesh(ringGeometry, ringMaterial);
    object.add(ringmesh);
    ringmesh.position.x = position;
    ringmesh.rotation.x = Math.PI / 2;
  }
  object.add(mesh);
  scene.add(object);
  mesh.position.x = position;
  if (!alt) {
    var labelDiv = document.createElement("div");
    labelDiv.className = "label";
    labelDiv.textContent = name;
    labelDiv.style.backgroundColor = "transparent";
    labelDiv.style.opacity = 0;

    const label = new CSS2DObject(labelDiv);
    label.position.set(0, 0, 0);
    label.center.set(0, 1.5);
    mesh.add(label);
  } else {
    var labelDiv = document.createElement("div");
    labelDiv.className = "labelAlt";
    labelDiv.textContent = name;
    labelDiv.style.backgroundColor = "transparent";
    labelDiv.style.opacity = 0;

    const label = new CSS2DObject(labelDiv);
    label.position.set(0, 0, 0);
    label.center.set(0, 3);
    mesh.add(label);
  }
  return { mesh: mesh, obj: object, ringmesh: ringmesh, label: labelDiv };
}

//generate planets
const mercury = generatePlanet(
  "Mercury",
  0.04 * dim.sunSize,
  1 * dim.mercuryDist,
  "mercury.jpg",
  false
);
const venus = generatePlanet(
  "Venus",
  0.09 * dim.sunSize,
  1.9 * dim.mercuryDist,
  "venus.jpg",
  false
);
const earth = generatePlanet(
  "Earth",
  0.1 * dim.sunSize,
  2.6 * dim.mercuryDist,
  "earth.jpg",
  false
);
const mars = generatePlanet(
  "Mars",
  0.05 * dim.sunSize,
  4 * dim.mercuryDist,
  "mars.jpg",
  false
);
const jupiter = generatePlanet(
  "Jupiter",
  0.25 * dim.sunSize,
  5.5 * dim.mercuryDist,
  "jupiter.jpg"
);
const saturn = generatePlanet(
  "Saturn",
  0.23 * dim.sunSize,
  7.2 * dim.mercuryDist,
  "saturn.jpg",
  false,
  {
    innerRadius: dim.sunSize / 4,
    outerRadius: dim.sunSize / 2,
    texture: "saturnring.png",
  }
);
const uranus = generatePlanet(
  "Uranus",
  0.18 * dim.sunSize,
  8.4 * dim.mercuryDist,
  "uranus.jpg",
  false,
  {
    innerRadius: dim.sunSize / 6,
    outerRadius: dim.sunSize / 3,
    texture: "uranusring.png",
  }
);
const neptune = generatePlanet(
  "Neptune",
  0.17 * dim.sunSize,
  9.9 * dim.mercuryDist,
  "neptune.jpg",
  false
);

//alt planets
const mercuryAlt = generatePlanet(
  "Mercury",
  0.04 * dim.sunSize,
  1 * dim.mercuryDist,
  "mercury.jpg",
  true
);
const venusAlt = generatePlanet(
  "Venus",
  0.09 * dim.sunSize,
  1.9 * dim.mercuryDist,
  "venus.jpg",
  true
);
const earthAlt = generatePlanet(
  "Earth",
  0.1 * dim.sunSize,
  2.6 * dim.mercuryDist,
  "earth.jpg",
  true
);
const marsAlt = generatePlanet(
  "Mars",
  0.05 * dim.sunSize,
  4 * dim.mercuryDist,
  "mars.jpg",
  true
);
const jupiterAlt = generatePlanet(
  "Jupiter",
  0.25 * dim.sunSize,
  5.5 * dim.mercuryDist,
  "jupiter.jpg",
  true
);
const saturnAlt = generatePlanet(
  "Saturn",
  0.23 * dim.sunSize,
  7.2 * dim.mercuryDist,
  "saturn.jpg",
  true,
  {
    innerRadius: dim.sunSize / 4,
    outerRadius: dim.sunSize / 2,
    texture: "saturnring.png",
  }
);
const uranusAlt = generatePlanet(
  "Uranus",
  0.18 * dim.sunSize,
  8.4 * dim.mercuryDist,
  "uranus.jpg",
  true,
  {
    innerRadius: dim.sunSize / 6,
    outerRadius: dim.sunSize / 3,
    texture: "uranusring.png",
  }
);
const neptuneAlt = generatePlanet(
  "Neptune",
  0.17 * dim.sunSize,
  9.9 * dim.mercuryDist,
  "neptune.jpg",
  true
);
altPlanetsOff();

//initial positions
mercury.obj.rotateY((THREE.MathUtils.randInt(-4, 4) * Math.PI) / 2);
venus.obj.rotateY((THREE.MathUtils.randInt(-4, 4) * Math.PI) / 2);
earth.obj.rotateY((THREE.MathUtils.randInt(-4, 4) * Math.PI) / 2);
mars.obj.rotateY((THREE.MathUtils.randInt(-4, 4) * Math.PI) / 2);
jupiter.obj.rotateY((THREE.MathUtils.randInt(-4, 4) * Math.PI) / 2);
saturn.obj.rotateY((THREE.MathUtils.randInt(-4, 4) * Math.PI) / 2);
uranus.obj.rotateY((THREE.MathUtils.randInt(-4, 4) * Math.PI) / 2);

//tilt function
function tiltVector(angle) {
  const x = Math.sin(THREE.MathUtils.degToRad(angle));
  const y = Math.cos(THREE.MathUtils.degToRad(angle));
  var vector = new THREE.Vector3(x, y, 0);
  return vector;
}

//tilt vectors
var sunTilt = tiltVector(7.25);
var sunAtmosTilt = tiltVector(7.25);
var mercuryTilt = tiltVector(0.03);
var venusTilt = tiltVector(177.3);
var earthTilt = tiltVector(23.5);
var marsTilt = tiltVector(25.2);
var jupiterTilt = tiltVector(3.13);
var saturnTilt = tiltVector(26.7);
var uranusTilt = tiltVector(97.8);
var neptuneTilt = tiltVector(28.3);

//resize window
window.addEventListener("resize", () => {
  (sizes.width = window.innerWidth),
    (sizes.height = window.innerHeight),
    (camera.aspect = sizes.width / sizes.height),
    camera.updateProjectionMatrix(),
    renderer.setSize(sizes.width, sizes.height);
  labelRenderer.setSize(sizes.width, sizes.height);
});

//background texture
const starTexture = new THREE.CubeTextureLoader(manager).load([
  "stars.jpg",
  "stars.jpg",
  "stars.jpg",
  "stars.jpg",
  "stars.jpg",
  "stars.jpg",
]);
scene.background = starTexture;

//gui parameters
const speedReset = {
  reset: function () {
    (dim.earthRot = 0.05), (dim.earthRev = 0.005);
  },
};
const camReset = {
  reset: function () {
    (camera.position.x = -100),
      (camera.position.y = 120),
      (camera.position.z = 250);
  },
};
const planetChecklist = {
  mercury: false,
  venus: false,
  earth: false,
  mars: false,
  jupiter: false,
  saturn: false,
  uranus: false,
  neptune: false,
  default: false,
};
function setChecklist(name) {
  for (let i in planetChecklist) {
    planetChecklist[i] = false;
  }
  planetChecklist[name] = true;
  if (planetChecklist["default"]) {
    dim.slowRate = 1;
    camReset.reset();
  }
}
const planets = {
  options: "default",
};
const orbitLabel = {
  label: false,
};
const planetLabel = {
  label: false,
};

//gui setup
const gui = new GUI();

let speedFolder = gui.addFolder("speed");
speedFolder.add(dim, "earthRot", 0, 1, 0.001).name("rotation").listen();
speedFolder.add(dim, "earthRev", 0, 0.1, 0.001).name("revolution").listen();
speedFolder.add(speedReset, "reset").name("reset");
speedFolder.open();

let camFolder = gui.addFolder("camera");
camFolder.add(camera.position, "x", -300, 300).listen();
camFolder.add(camera.position, "y", -300, 300).listen();
camFolder.add(camera.position, "z", -300, 300).listen();
camFolder.add(camReset, "reset").name("reset");
camFolder.open();

let planetFolder = gui.addFolder("planets");
planetFolder
  .add(planets, "options", [
    "default",
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ])
  .name("view")
  .listen()
  .onChange((newValue) => setChecklist(newValue));
planetFolder.open();

let labelFolder = gui.addFolder("labels");
labelFolder.add(orbitLabel, "label").name("orbit").listen();
labelFolder.add(planetLabel, "label").name("planet name").listen();
labelFolder.open();

//animation loop
const loop = () => {
  //planet view
  if (planetChecklist.default) {
    planetsOn();
    altPlanetsOff();
    altPlanetsLabelOff();
    const look = new THREE.Vector3(0, 0, 0);
    camera.lookAt(look);
  }

  if (planetChecklist.mercury) {
    dim.slowRate = 0.2;
    planetsOn(mercury);
    altPlanetsOff(mercuryAlt);
    mercury.label.style.opacity = 0;
    venusAlt.label.style.opacity = 0;
    earthAlt.label.style.opacity = 0;
    marsAlt.label.style.opacity = 0;
    jupiterAlt.label.style.opacity = 0;
    saturnAlt.label.style.opacity = 0;
    uranusAlt.label.style.opacity = 0;
    neptuneAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  if (planetChecklist.venus) {
    dim.slowRate = 0.2;
    planetsOn(venus);
    altPlanetsOff(venusAlt);
    venus.label.style.opacity = 0;
    mercuryAlt.label.style.opacity = 0;
    earthAlt.label.style.opacity = 0;
    marsAlt.label.style.opacity = 0;
    jupiterAlt.label.style.opacity = 0;
    saturnAlt.label.style.opacity = 0;
    uranusAlt.label.style.opacity = 0;
    neptuneAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(1.9 * dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * 1.9 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  if (planetChecklist.earth) {
    dim.slowRate = 0.2;
    planetsOn(earth);
    altPlanetsOff(earthAlt);
    earth.label.style.opacity = 0;
    mercuryAlt.label.style.opacity = 0;
    venusAlt.label.style.opacity = 0;
    marsAlt.label.style.opacity = 0;
    jupiterAlt.label.style.opacity = 0;
    saturnAlt.label.style.opacity = 0;
    uranusAlt.label.style.opacity = 0;
    neptuneAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(2.6 * dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * 2.6 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  if (planetChecklist.mars) {
    dim.slowRate = 0.2;
    planetsOn(mars);
    altPlanetsOff(marsAlt);
    mars.label.style.opacity = 0;
    mercuryAlt.label.style.opacity = 0;
    venusAlt.label.style.opacity = 0;
    earthAlt.label.style.opacity = 0;
    jupiterAlt.label.style.opacity = 0;
    saturnAlt.label.style.opacity = 0;
    uranusAlt.label.style.opacity = 0;
    neptuneAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(4 * dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * 4 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  if (planetChecklist.jupiter) {
    dim.slowRate = 0.2;
    planetsOn(jupiter);
    altPlanetsOff(jupiterAlt);
    jupiter.label.style.opacity = 0;
    mercuryAlt.label.style.opacity = 0;
    venusAlt.label.style.opacity = 0;
    earthAlt.label.style.opacity = 0;
    marsAlt.label.style.opacity = 0;
    saturnAlt.label.style.opacity = 0;
    uranusAlt.label.style.opacity = 0;
    neptuneAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(5.5 * dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * 5.5 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  if (planetChecklist.saturn) {
    dim.slowRate = 0.2;
    planetsOn(saturn);
    altPlanetsOff(saturnAlt);
    saturn.label.style.opacity = 0;
    mercuryAlt.label.style.opacity = 0;
    venusAlt.label.style.opacity = 0;
    earthAlt.label.style.opacity = 0;
    marsAlt.label.style.opacity = 0;
    jupiterAlt.label.style.opacity = 0;
    uranusAlt.label.style.opacity = 0;
    neptuneAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(7.2 * dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * 7.2 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  if (planetChecklist.uranus) {
    dim.slowRate = 0.2;
    planetsOn(uranus);
    altPlanetsOff(uranusAlt);
    uranus.label.style.opacity = 0;
    mercuryAlt.label.style.opacity = 0;
    venusAlt.label.style.opacity = 0;
    earthAlt.label.style.opacity = 0;
    marsAlt.label.style.opacity = 0;
    jupiterAlt.label.style.opacity = 0;
    saturnAlt.label.style.opacity = 0;
    neptuneAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(8.4 * dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * 8.4 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  if (planetChecklist.neptune) {
    dim.slowRate = 0.2;
    planetsOn(neptune);
    altPlanetsOff(neptuneAlt);
    neptune.label.style.opacity = 0;
    mercuryAlt.label.style.opacity = 0;
    venusAlt.label.style.opacity = 0;
    earthAlt.label.style.opacity = 0;
    marsAlt.label.style.opacity = 0;
    jupiterAlt.label.style.opacity = 0;
    saturnAlt.label.style.opacity = 0;
    uranusAlt.label.style.opacity = 0;
    const look = new THREE.Vector3(9.9 * dim.mercuryDist, 0, 0);
    const pos = new THREE.Vector3(1.2 * 9.9 * dim.mercuryDist, 2, 7);
    camera.position.lerp(pos, 0.01);
    camera.lookAt(look);
  }

  //gui orbit
  if (orbitLabel.label) {
    mercuryOrbit.mesh.visible = true;
    venusOrbit.mesh.visible = true;
    earthOrbit.mesh.visible = true;
    marsOrbit.mesh.visible = true;
    jupiterOrbit.mesh.visible = true;
    saturnOrbit.mesh.visible = true;
    uranusOrbit.mesh.visible = true;
    neptuneOrbit.mesh.visible = true;
  }
  //gui label
  if (planetLabel.label) {
    sunLabelDiv.style.opacity = 1;
    if (mercury.obj.visible) {
      mercury.label.style.opacity = 1;
    } else {
      mercury.label.style.opacity = 0;
    }
    if (venus.obj.visible) {
      venus.label.style.opacity = 1;
    } else {
      venus.label.style.opacity = 0;
    }
    if (earth.obj.visible) {
      earth.label.style.opacity = 1;
    } else {
      earth.label.style.opacity = 0;
    }
    if (mars.obj.visible) {
      mars.label.style.opacity = 1;
    } else {
      mars.label.style.opacity = 0;
    }
    if (jupiter.obj.visible) {
      jupiter.label.style.opacity = 1;
    } else {
      jupiter.label.style.opacity = 0;
    }
    if (saturn.obj.visible) {
      saturn.label.style.opacity = 1;
    } else {
      saturn.label.style.opacity = 0;
    }
    if (uranus.obj.visible) {
      uranus.label.style.opacity = 1;
    } else {
      uranus.label.style.opacity = 0;
    }
    if (neptune.obj.visible) {
      neptune.label.style.opacity = 1;
    } else {
      neptune.label.style.opacity = 0;
    }
    if (mercuryAlt.obj.visible) {
      mercuryAlt.label.style.opacity = 1;
    } else {
      mercuryAlt.label.style.opacity = 0;
    }
    if (venusAlt.obj.visible) {
      venusAlt.label.style.opacity = 1;
    } else {
      venusAlt.label.style.opacity = 0;
    }
    if (earthAlt.obj.visible) {
      earthAlt.label.style.opacity = 1;
    } else {
      earthAlt.label.style.opacity = 0;
    }
    if (marsAlt.obj.visible) {
      marsAlt.label.style.opacity = 1;
    } else {
      marsAlt.label.style.opacity = 0;
    }
    if (jupiterAlt.obj.visible) {
      jupiterAlt.label.style.opacity = 1;
    } else {
      jupiterAlt.label.style.opacity = 0;
    }
    if (saturnAlt.obj.visible) {
      saturnAlt.label.style.opacity = 1;
    } else {
      saturnAlt.label.style.opacity = 0;
    }
    if (uranusAlt.obj.visible) {
      uranusAlt.label.style.opacity = 1;
    } else {
      uranusAlt.label.style.opacity = 0;
    }
    if (neptuneAlt.obj.visible) {
      neptuneAlt.label.style.opacity = 1;
    } else {
      neptuneAlt.label.style.opacity = 0;
    }
  }

  //tilt rotation
  sun.rotateOnAxis(sunTilt, 0.04 * dim.earthRot * dim.slowRate);
  sunAtmos.rotateOnAxis(sunAtmosTilt, -0.01 * dim.earthRot * dim.slowRate);
  mercury.mesh.rotateOnAxis(mercuryTilt, 0.02 * dim.earthRot * dim.slowRate);
  venus.mesh.rotateOnAxis(venusTilt, 0.004 * dim.earthRot * dim.slowRate);
  earth.mesh.rotateOnAxis(earthTilt, 1 * dim.earthRot * dim.slowRate);
  mars.mesh.rotateOnAxis(marsTilt, 0.9 * dim.earthRot * dim.slowRate);
  jupiter.mesh.rotateOnAxis(jupiterTilt, 2.4 * dim.earthRot * dim.slowRate);
  saturn.mesh.rotateOnAxis(saturnTilt, 2.2 * dim.earthRot * dim.slowRate);
  saturn.ringmesh.rotateOnAxis(saturnTilt, 0.22 * dim.earthRot * dim.slowRate);
  uranus.mesh.rotateOnAxis(uranusTilt, 1.4 * dim.earthRot * dim.slowRate);
  uranus.ringmesh.rotateOnAxis(uranusTilt, 0.14 * dim.earthRot * dim.slowRate);
  neptune.mesh.rotateOnAxis(neptuneTilt, 1.5 * dim.earthRot * dim.slowRate);
  mercuryAlt.mesh.rotateOnAxis(mercuryTilt, 0.02 * dim.earthRot * dim.slowRate);
  venusAlt.mesh.rotateOnAxis(venusTilt, 0.004 * dim.earthRot * dim.slowRate);
  earthAlt.mesh.rotateOnAxis(earthTilt, 1 * dim.earthRot * dim.slowRate);
  marsAlt.mesh.rotateOnAxis(marsTilt, 0.9 * dim.earthRot * dim.slowRate);
  jupiterAlt.mesh.rotateOnAxis(jupiterTilt, 2.4 * dim.earthRot * dim.slowRate);
  saturnAlt.mesh.rotateOnAxis(saturnTilt, 2.2 * dim.earthRot * dim.slowRate);
  saturnAlt.ringmesh.rotateOnAxis(
    saturnTilt,
    0.22 * dim.earthRot * dim.slowRate
  );
  uranusAlt.mesh.rotateOnAxis(uranusTilt, 1.4 * dim.earthRot * dim.slowRate);
  uranusAlt.ringmesh.rotateOnAxis(
    uranusTilt,
    0.14 * dim.earthRot * dim.slowRate
  );
  neptuneAlt.mesh.rotateOnAxis(neptuneTilt, 1.5 * dim.earthRot * dim.slowRate);

  //solar revolution
  mercury.obj.rotateY(4.1 * dim.earthRev * dim.slowRate);
  mercury.obj.updateMatrixWorld();
  venus.obj.rotateY(1.6 * dim.earthRev * dim.slowRate);
  earth.obj.rotateY(1 * dim.earthRev * dim.slowRate);
  mars.obj.rotateY(0.5 * dim.earthRev * dim.slowRate);
  jupiter.obj.rotateY(0.08 * 5 * dim.earthRev * dim.slowRate);
  saturn.obj.rotateY(0.03 * 5 * dim.earthRev * dim.slowRate);
  uranus.obj.rotateY(0.01 * 5 * dim.earthRev * dim.slowRate);
  neptune.obj.rotateY(0.006 * 5 * dim.earthRev * dim.slowRate);

  //animation updates
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  window.requestAnimationFrame(loop);
  controls.update();
};
loop();

function orbitsOn() {
  mercuryOrbit.mesh.visible = true;
  venusOrbit.mesh.visible = true;
  earthOrbit.mesh.visible = true;
  marsOrbit.mesh.visible = true;
  jupiterOrbit.mesh.visible = true;
  saturnOrbit.mesh.visible = true;
  uranusOrbit.mesh.visible = true;
  neptuneOrbit.mesh.visible = true;
}

function orbitsOff() {
  mercuryOrbit.mesh.visible = false;
  venusOrbit.mesh.visible = false;
  earthOrbit.mesh.visible = false;
  marsOrbit.mesh.visible = false;
  jupiterOrbit.mesh.visible = false;
  saturnOrbit.mesh.visible = false;
  uranusOrbit.mesh.visible = false;
  neptuneOrbit.mesh.visible = false;
}

function planetsOn(name) {
  mercury.obj.visible = true;
  venus.obj.visible = true;
  earth.obj.visible = true;
  mars.obj.visible = true;
  jupiter.obj.visible = true;
  saturn.obj.visible = true;
  uranus.obj.visible = true;
  neptune.obj.visible = true;
  if (name !== undefined) {
    name.obj.visible = false;
  }
}

function altPlanetsOff(name) {
  mercuryAlt.obj.visible = false;
  venusAlt.obj.visible = false;
  earthAlt.obj.visible = false;
  marsAlt.obj.visible = false;
  jupiterAlt.obj.visible = false;
  saturnAlt.obj.visible = false;
  uranusAlt.obj.visible = false;
  neptuneAlt.obj.visible = false;
  if (name !== undefined) {
    name.obj.visible = true;
  }
}

function planetsLabelOn(name) {
  mercury.label.style.opacity = 1;
  venus.label.style.opacity = 1;
  earth.label.style.opacity = 1;
  mars.label.style.opacity = 1;
  jupiter.label.style.opacity = 1;
  saturn.label.style.opacity = 1;
  uranus.label.style.opacity = 1;
  neptune.label.style.opacity = 1;
  if (name !== undefined) {
    name.label.style.opacity = 0;
  }
}

function planetsLabelOff(name) {
  mercury.label.style.opacity = 0;
  venus.label.style.opacity = 0;
  earth.label.style.opacity = 0;
  mars.label.style.opacity = 0;
  jupiter.label.style.opacity = 0;
  saturn.label.style.opacity = 0;
  uranus.label.style.opacity = 0;
  neptune.label.style.opacity = 0;
  if (name !== undefined) {
    name.label.style.opacity = 1;
  }
}

function altPlanetsLabelOn(name) {
  mercuryAlt.label.style.opacity = 1;
  venusAlt.label.style.opacity = 1;
  earthAlt.label.style.opacity = 1;
  marsAlt.label.style.opacity = 1;
  jupiterAlt.label.style.opacity = 1;
  saturnAlt.label.style.opacity = 1;
  uranusAlt.label.style.opacity = 1;
  neptuneAlt.label.style.opacity = 1;
  if (name !== undefined) {
    name.label.style.opacity = 0;
  }
}

function altPlanetsLabelOff(name) {
  if (name !== undefined) {
    name.label.style.opacity = 1;
  }
  mercuryAlt.label.style.opacity = 0;
  venusAlt.label.style.opacity = 0;
  earthAlt.label.style.opacity = 0;
  marsAlt.label.style.opacity = 0;
  jupiterAlt.label.style.opacity = 0;
  saturnAlt.label.style.opacity = 0;
  uranusAlt.label.style.opacity = 0;
  neptuneAlt.label.style.opacity = 0;
  if (name !== undefined) {
    name.label.style.opacity = 1;
  }
}
