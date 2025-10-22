import * as THREE from 'three'; //import Three.js

import * as TEMPLATE from './template.js'; //import template code

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; //Loader for assets
import { GamepadWrapper, XR_BUTTONS, XR_AXES } from 'gamepad-wrapper'; //Gamepad input controls
import { gsap } from 'gsap'; //Js library to simplify animation
import { init } from './init.js'; //init script
import { color } from 'three/tsl';

window.addEventListener('load', Initialize);
function Initialize() {
  init(setupScene, onFrame);
}

function setupScene(globals : Globals) {

  //#region Samples
  TEMPLATE.addTemplateObjects(globals.scene);
  const horizontalPanel = TEMPLATE.CreatePanel({position: new THREE.Vector3(0,2.5,-1), rotation: new THREE.Euler(Math.PI/8,0,0), width:2.5, height:1, depth:0.1, parameters:{color:'#662dcf', transparent:true, opacity:.6} });
  const leftVerticalPanel = TEMPLATE.CreatePanel({position: new THREE.Vector3(-1.75,1,-1), rotation: new THREE.Euler(0, Math.PI/4,0), width:1, height:2.5, depth:0.1, parameters:{color:'#662dcf', transparent:true, opacity:.6} });
  const rightVerticalPanel = TEMPLATE.CreatePanel({position: new THREE.Vector3(1.75,1,-1), rotation: new THREE.Euler(0, -Math.PI/4,0), width:1, height:2.5, depth:0.1, parameters:{color:'#662dcf', transparent:true, opacity:.6} });
  globals.scene.add(rightVerticalPanel);
  TEMPLATE.showTextPanel(globals.scene, horizontalPanel, {text:'WebXR Template', justification:'center', alignment:'center'});
  TEMPLATE.showTextPanel(globals.scene, leftVerticalPanel, {text:'By\nCornillie\nJeffrey', fontSize:0.24, justification:'center', alignment:'center', innerTextAlign:'center'});
  TEMPLATE.showTextPanel(globals.scene, rightVerticalPanel, {text:'Use this template\nto start your project', fontSize:0.1, justification:'start', alignment:'start', innerTextAlign:'left', });

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
  const { canvas, scene, camera, renderer, player, controllers, stats } = globals;


  //#region Samples
  TEMPLATE.addTemplateMovement(player, camera, controllers);
  TEMPLATE.addTemplateRotation(player, controllers);
  TEMPLATE.addTemplateJump(player, controllers);
  TEMPLATE.addTemplateInteraction(scene, controllers);
  TEMPLATE.addTemplatePhysics(scene,delta);
  //#endregion Samples

  gsap.ticker.tick(); //Keep animations synced with game loop
}
