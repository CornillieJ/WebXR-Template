import * as THREE from 'three'; //import Three.js

import * as TEMPLATE from './template.js'; //import template code

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; //Loader for assets
import { GamepadWrapper, XR_BUTTONS, XR_AXES } from 'gamepad-wrapper'; //Gamepad input controls
import { gsap } from 'gsap'; //Js library to simplify animation
import { init } from './init.js'; //init script

window.addEventListener('load', Initialize);
function Initialize() {
  init(setupScene, onFrame);
}

function setupScene({ canvas, scene, camera, renderer, player, controllers }) {
  //Sample code I made, delete this before starting
  TEMPLATE.addTemplateObjects(scene);

  /* Load and add assets to set up the base scene here:

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('PATH_TO_ASSET', (gltf)=>{
   	scene.add(gltf.scene);
  });

  */
}

function onFrame(delta, time, { canvas, scene, camera, renderer, player, controllers }) {
  //Logic to run each frame

  //Sample code I made, delete this before starting
  TEMPLATE.addTemplateMovement(player, camera, controllers);
  TEMPLATE.addTemplateJump(player, controllers);
  TEMPLATE.addTemplateInteraction(scene, controllers);

  gsap.ticker.tick(delta); //Keep animations synced with game loop
}
