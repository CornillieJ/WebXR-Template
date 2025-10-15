import type {Sizes, ControllerType, Controllers, Globals }  from './types.ts'
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

function setupScene(globals : Globals) {

  //#region Samples
  TEMPLATE.addTemplateObjects(globals.scene);
  //#endregion Samples


  /* Load and add assets to set up the base scene here:
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('PATH_TO_ASSET', (gltf)=>{
   	scene.add(gltf.scene);
  });
  */

}

function onFrame(delta : number, time : number, globals: Globals) {
  //Logic to run each frame


  // deconstruct Globals
  const { canvas, scene, camera, renderer, player, controllers } = globals;


  //#region Samples
  TEMPLATE.addTemplateMovement(player, camera, controllers);
  TEMPLATE.addTemplateRotation(player, controllers);
  TEMPLATE.addTemplateJump(player, controllers);
  TEMPLATE.addTemplateInteraction(scene, controllers);
  //#endregion Samples

  gsap.ticker.tick(); //Keep animations synced with game loop
}
