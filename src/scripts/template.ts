// import type {Sizes, ControllerType, Controllers, Globals }  from './types/types.js'
import * as HELPER from './helpers.js';

import * as THREE from 'three'; //import Three.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; //Loader for assets
import { GamepadWrapper, XR_BUTTONS, XR_AXES } from 'gamepad-wrapper'; //Gamepad input controls
import { gsap } from 'gsap'; //Js library to simplify animation
import { RoundedBoxGeometry } from 'three-stdlib';

//packages without types
// @ts-ignore
import {Text} from 'troika-three-text'; //Library for text in ThreeJs
import { color } from 'three/tsl';

export function addTemplateObjects(scene : THREE.Scene) {
  //Add die
  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  const diePaths = ['die/1.jpg', 'die/6.jpg', 'die/5.jpg', 'die/2.jpg', 'die/3.jpg', 'die/4.jpg'];
  const materials = diePaths.map((path) => new THREE.MeshStandardMaterial({ map: textureLoader.load(path) }));
  const die = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), materials);
  die.receiveShadow = true;
  die.position.set(0, 1, -1);
  die.userData.interactable = true;
  die.userData.hasPhysics = true;
  scene.add(die);
  const die2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
  die2.receiveShadow = true;
  die2.position.set(0, 1, -3);
  die2.userData.interactable = true;
  die2.userData.hasPhysics = true;
  scene.add(die2);

  //Extra lighting
  const dirLight = new THREE.DirectionalLight(0xff0000, 0.5);
  dirLight.position.set(5, 5, 5);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight);

  //Ground plane
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const grassTexture = textureLoader.load('grass.png');
  const grassMaterial = new THREE.MeshStandardMaterial({map:grassTexture, color : 0xD0D0D0 , roughness:0.8});
  
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(20, 20);

  const floor = new THREE.Mesh(floorGeometry, grassMaterial);
  floor.position.setY(0);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.userData.isCollider = true;
  scene.add(floor);

  // Add skybox 
  gltfLoader.load('skybox.glb', (gltf) => {
    const skybox = gltf.scene;
    skybox.scale.set(10, 10, 10);
    scene.add(skybox);
  });
}

export function addTemplateMovement(player:THREE.Group, camera : THREE.Camera, controllers : Controllers) {
  if (!controllers.left) return;

  const x = controllers.left.gamepad.getAxis(XR_AXES.THUMBSTICK_X);
  const y = controllers.left.gamepad.getAxis(XR_AXES.THUMBSTICK_Y);

  const speed = 0.01;
  // Deadzone to prevent drift
  const deadzone = 0.15;
  if (Math.abs(x) < deadzone && Math.abs(y) < deadzone) return;

  //Get forward vector
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0; // looking up or down should not affect movement
  forward.normalize(); //normalize to 1

  //Get perpendicular vector for strafing
  const right = new THREE.Vector3();
  right.crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

  // Calculate movement vector
  const moveX = right.multiplyScalar(-x * speed);
  const moveZ = forward.multiplyScalar(-y * speed); //Forward is negative in Three.Js

  // Add movement to player position
  player.position.add(moveX);
  player.position.add(moveZ);
}

export function addTemplateRotation(player:THREE.Group, controllers : Controllers) {
  if (!controllers.right) return;

  const x = controllers.right.gamepad.getAxis(XR_AXES.THUMBSTICK_X);
  const deadzone = 0.6;
  const returnZone = 0.5;

  //Reset turning when returned to returnZone
  if (Math.abs(x) < returnZone && player.userData.turning) {
    player.userData.turning = false;
    return;
  }

  //ignore small movements and if user holds joystick outside of return zone (single snapping)
  if (Math.abs(x) < deadzone || player.userData.turning) return;

  const angleInDegrees = 15;
  const angleInRadians = THREE.MathUtils.degToRad(angleInDegrees);

  const axis = new THREE.Vector3(0, Math.sign(-x), 0); //Get correct direction

  player.rotateOnAxis(axis, angleInRadians);
  player.userData.turning = true;
}

export function addTemplateJump(player:THREE.Group, controllers : Controllers) {
  if (!controllers.right) return;

  const buttonPressed = controllers.right.gamepad.getButtonUp(XR_BUTTONS.BUTTON_1);
  if (buttonPressed && !player.userData.isJumping) {
    player.userData.isJumping = true;

    const jumpHeight = 1.0;
    const jumpDuration = 0.3;
    const fallDuration = 0.4;

    // Animate up
    gsap.to(player.position, {
      y: player.position.y + jumpHeight,
      duration: jumpDuration,
      ease: 'back.in',
      onComplete: () => {
        // Animate down
        gsap.to(player.position, {
          y: 0,
          duration: fallDuration,
          ease: 'circ.in',
          onComplete: () => {
            player.userData.isJumping = false;
          },
        });
      },
    });
  }
}

export function addTemplateInteraction(scene : THREE.Scene, controllers : Controllers) {
  if (!controllers.right && !controllers.left) return;

  const interactableObjects = HELPER.getObjectsWithFeature(scene,'interactable');

  Object.values(controllers)
    .filter(controller=>controller !== undefined)
    .forEach((controller) => {
    const grabStarted = controller.gamepad.getButtonDown(XR_BUTTONS.SQUEEZE);
    const grabHeldDown = controller.gamepad.getButton(XR_BUTTONS.SQUEEZE);

    if (grabStarted) {
      const intersectedObject = HELPER.checkControllerOverlap(controller, interactableObjects);
      HELPER.holdItem(controller,intersectedObject);
    }
    else if (!grabHeldDown){
      HELPER.letGoOfItem(scene,controller);
    }
  });
}

export function addTemplatePhysics(scene: THREE.Scene, deltaTime: number ,gravity: number = -9.81) {
  const hasPhysicsObjects = HELPER.getObjectsWithFeature(scene,'hasPhysics');
  const colliderObjects = HELPER.getObjectsWithFeature(scene, 'isCollider');
  const allPhysicsObjects =  [...hasPhysicsObjects,...colliderObjects];

  hasPhysicsObjects.forEach(obj => {
    if(obj.userData.isHeld){
      obj.userData.velocity = new THREE.Vector3(0, 0, 0);
      return;
    }

    obj.userData.velocity ??= new THREE.Vector3(0, 0, 0); //new if not present

    const groundLevel = 0;
    const previousPosition = obj.position.clone();
    const previousRotation = obj.rotation.clone();
    const objBox = new THREE.Box3().setFromObject(obj);
    const bottomY = objBox.min.y;
    const velocity: THREE.Vector3 = obj.userData.velocity;

    if (bottomY <= groundLevel) { // No gravity if on ground
      const offsetY = obj.position.y - bottomY; // distance from position to bottom
      obj.position.y = offsetY;
      obj.userData.velocity.y = 0;  // stop downward velocity
      return;
    }

    // Add simple vertical gravity
    velocity.y += gravity * deltaTime;

    // Update position based on velocity
    obj.position.addScaledVector(velocity, deltaTime);


    //For each object, check collision with all other objects
    HELPER.checkCollision(obj, previousPosition, allPhysicsObjects);
    obj.userData.lastSafePosition = previousPosition;
    obj.userData.lastSafeRotation = previousRotation;

  });
}


export function showTextPanel(scene: THREE.Scene, panel: THREE.Mesh, textInfo: TextInfo) {
  const output = new Text();
  output.fontWeight = textInfo.fontWeight;
  output.textAlign = textInfo.innerTextAlign;
  output.fontSize = textInfo.fontSize?? 0.24;
  output.color = textInfo.color??0xffffff;
  output.text = textInfo.text ?? '';
  output.position.z = (panel.userData.depth/2) + 0.01;

  const outputGroup = new THREE.Group();
  outputGroup.position.copy(panel.position);
  outputGroup.rotation.copy(panel.rotation);
  panel.position.set(0,0,0);
  panel.rotation.set(0,0,0);
  outputGroup.add(panel)
  outputGroup.add(output);
  scene.add(outputGroup)

  setJustificationAndAlignment(panel, output, textInfo);
  output.sync();

  return outputGroup;
}

export function CreatePanel(objectInfo:ObjectInfo) {
  const panel = new THREE.Mesh(
    new RoundedBoxGeometry(objectInfo.width, objectInfo.height, objectInfo.depth, 5, 5),
    new THREE.MeshBasicMaterial(objectInfo.parameters)
  );

  panel.userData.width = objectInfo.width;
  panel.userData.height = objectInfo.height;
  panel.userData.depth = objectInfo.depth;

  panel.position.copy(objectInfo.position ?? new THREE.Vector3(0,0,0));
  panel.rotation.copy(objectInfo.rotation ?? new THREE.Euler(0,0,0));

  return panel;
}

function setJustificationAndAlignment(panel:THREE.Mesh, output: Text, textInfo: TextInfo) {
  let outputSize= new THREE.Vector3();
  const outputBox = new THREE.Box3().setFromObject(output).getSize(outputSize);

  const margin = .05;

  if (textInfo.justification === 'center')
    output.anchorX = '50%';
  if (textInfo.alignment === 'center')
    output.anchorY = '50%';
  if (textInfo.justification === 'start')
    output.position.x = -(panel.userData.width/2) + margin;
  if (textInfo.alignment === 'start')
    output.position.y = (panel.userData.height/2) - margin;
}

