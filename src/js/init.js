import * as THREE from 'three'; //Three.js

import { GamepadWrapper } from 'gamepad-wrapper'; //Gamepad input controls

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; //mouse+kb controls
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'; //Official add-on for a room environment
import { VRButton } from 'three/addons/webxr/VRButton.js'; //Add button to enter VR mode
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js'; //3D models for controllers

export function init(setupScene = () => {}, onFrame = () => {}) {
  const globals = setupGlobals();

  //Handle resize event
  window.addEventListener('resize', () => updateSizes(globals));

  //Set up orbitControls
  const controls = new OrbitControls(globals.camera, globals.canvas);
  controls.target.set(0, 1.6, 0);
  controls.update();

  //Add VR button
  document.body.appendChild(VRButton.createButton(globals.renderer));

  //Run Scene Setup from logic script
  setupScene(globals);

  //Start main loop
  const clock = new THREE.Clock();
  function animate() {
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    Object.values(globals.controllers).forEach((controller) => {
      if (controller?.gamepad) controller.gamepad?.update();
    });

    //Run logic from Logic script on every frame
    onFrame(delta, time, globals);
    globals.renderer.render(globals.scene, globals.camera);
  }

  globals.renderer.setAnimationLoop(animate);
}
function updateSizes(globals) {
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  // Update camera
  globals.camera.aspect = sizes.width / sizes.height;
  globals.camera.updateProjectionMatrix();

  // Update renderer
  globals.renderer.setSize(sizes.width, sizes.height);
  globals.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function setupGlobals() {
  //Get canvas
  let canvas = document.querySelector('canvas.webgl');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.classList.add('webgl');
    document.body.appendChild(canvas);
  }
  //Define window sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  //Setup Scene
  const scene = new THREE.Scene();

  //Setup Camera
  const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 100);
  camera.position.set(0, 1.7, 3);

  // create and add player group and add camera to the group
  const player = new THREE.Group();
  player.add(camera);
  scene.add(player);

  //Set up renderer
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(sizes.width, sizes.height);
  renderer.xr.enabled = true; //This enables XR

  //Set up the built in environment
  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator(renderer); //Prefiltered Mipmap Radiance Environment Map Generator
  pmremGenerator.compileEquirectangularShader();
  const environmentMap = pmremGenerator.fromScene(environment).texture; //Generates an environment texture from the room preset, enabling realistic lighting on all PBR materials
  scene.environment = environmentMap;
  scene.background = environmentMap;
  pmremGenerator.dispose();

  //Create controllers
  const controllers = createControllers(player, renderer);

  return {
    canvas,
    scene,
    camera,
    renderer,
    player,
    controllers,
  };
}

function createControllers(player, renderer) {
  const controllerModelFactory = new XRControllerModelFactory();
  const controllers = {
    left: null,
    right: null,
  };
  for (let i = 0; i < 2; i++) {
    const raySpace = renderer.xr.getController(i);
    const gripSpace = renderer.xr.getControllerGrip(i);
    const mesh = controllerModelFactory.createControllerModel(gripSpace);
    const group = new THREE.Group();
    gripSpace.add(mesh);
    player.add(raySpace, gripSpace);
    raySpace.visible = false;
    gripSpace.visible = false;
    gripSpace.addEventListener('connected', (e) => {
      raySpace.visible = true;
      gripSpace.visible = true;
      const handedness = e.data.handedness;
      controllers[handedness] = {
        raySpace,
        gripSpace,
        mesh,
        gamepad: new GamepadWrapper(e.data.gamepad),
      };
    });
    gripSpace.addEventListener('disconnected', (e) => {
      raySpace.visible = false;
      gripSpace.visible = false;
      const handedness = e.data.handedness;
      controllers[handedness] = null;
    });
  }
  return controllers;
}
