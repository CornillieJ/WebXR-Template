import * as THREE from 'three'; //import Three.js

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; //Loader for assets
import { Text } from 'troika-three-text'; // Three.js text
import { GamepadWrapper, XR_BUTTONS, XR_AXES } from 'gamepad-wrapper'; //Gamepad input controls
import { gsap } from 'gsap'; //Js library to simplify animation
import { init } from './init.js'; //init script

window.addEventListener('load', Initialize);
function Initialize() {
  init(setupScene, onFrame);
}

function setupScene({ canvas, scene, camera, renderer, player, controllers }) {
  addTemplateObjects(scene); //Delete this, it's just an example I made

  //Load and add assets to set up the base scene
  //const gltfLoader = new GLTFLoader();
  // gltfLoader.load('PATH_TO_ASSET', (gltf)=>{
  // 	scene.add(gltf.scene);
  // });
}

function onFrame(delta, time, { canvas, scene, camera, renderer, player, controllers }) {
  //Logic to run each frame
  addTemplateMovement(player, camera, controllers); //Delete this, it's just an example I made
  addTemplateJump(player, controllers); //Delete this, it's just an example I made
  addTemplateInteraction(scene, controllers);
  gsap.ticker.tick(delta); //Keep animations synced with game loop
}

function addTemplateObjects(scene) {
  // Add die

  var loader = new THREE.TextureLoader();
  var diePaths = [
    'https://th.bing.com/th/id/OIP.OB8xNviXvEcA3WNU-7RIRQHaHa?w=228&h=219&c=7&o=5&pid=1.7',
    'https://th.bing.com/th/id/OIP.osXPM7NHeNro5XF3MDVZWgHaHa?w=213&h=213&c=7&o=5&pid=1.7',
    'https://th.bing.com/th/id/OIP.eolV3-TnCn6QrLAuuAa5zAHaHa?w=206&h=203&c=7&o=5&pid=1.7',
    'https://th.bing.com/th/id/OIP.eM85mOKZcT8ufGMqUVxKmAHaHa?w=230&h=220&c=7&o=5&pid=1.7',
    'https://th.bing.com/th/id/OIP.sMkR0TyI2E7vER-CZFe-awHaHa?w=224&h=219&c=7&o=5&pid=1.7',
    'https://th.bing.com/th/id/OIP.Pn_7h3NqUQTVrQF4wn1YkQHaHa?w=218&h=208&c=7&o=5&pid=1.7',
  ];
  const materials = diePaths.map((path) => new THREE.MeshStandardMaterial({ map: loader.load(path) }));
  const die = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), materials);
  die.receiveShadow = true;
  die.position.set(0, 1, -1);
  die.userData.interactable = true;
  scene.add(die);

  // Basic lighting
  const dirLight = new THREE.DirectionalLight(0xff0000, 0.5);
  dirLight.position.set(5, 5, 5);
  dirLight.lookAt(0, 0, 0);
  scene.add(dirLight);

  // Ground plane
  const floorGeometry = new THREE.PlaneGeometry(100, 100);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x975c35, roughness: 0.8 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.setY(0);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
}

function addTemplateMovement(player, camera, controllers) {
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
  console.log(forward);
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

function addTemplateJump(player, controllers) {
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

function addTemplateInteraction(scene, controllers) {
  if (!controllers.right && !controllers.left) return;

  const interactableObjects = [];
  scene.traverse((object) => {
    if (object.userData && object.userData.interactable) {
      interactableObjects.push(object);
    }
  });

  Object.values(controllers).forEach((controller) => {
    const grabStarted = controller.gamepad.getButtonDown(XR_BUTTONS.SQUEEZE);
    const grabHeld = controller.gamepad.getButton(XR_BUTTONS.SQUEEZE);
    if (grabStarted) {
      const intersected = checkControllerOverlap(controller, interactableObjects);
      if (intersected && !controller.mesh.userData?.grabbedObject) {
        controller.mesh.userData.grabbedObject = intersected;
        const offsetData = getOffsetsBetweenObjects(controller.raySpace, intersected);
        controller.raySpace.add(intersected);
        intersected.position.copy(offsetData.positionOffset);
        intersected.quaternion.copy(offsetData.quaternionOffset);

        // controller.mesh.userData.grabOffset = grabOffset.clone();
      }
    }
    if (!grabHeld && controller.mesh.userData.grabbedObject) {
      const grabbedObject = controller.mesh.userData.grabbedObject;
      const locationData = getWorldPositionAndRotation(grabbedObject);

      controller.raySpace.remove(grabbedObject);
      controller.mesh.userData.grabbedObject = null;

      grabbedObject.position.copy(locationData.position);
      grabbedObject.quaternion.copy(locationData.quaternion);
      scene.add(grabbedObject);
    }
  });
}

function checkControllerOverlap(controller, interactableObjects) {
  // Update bounding box for controller mesh
  const controllerBox = new THREE.Box3().setFromObject(controller.mesh);

  for (const obj of interactableObjects) {
    if (obj && obj.isMesh) {
      // Update bounding box for object
      const objectBox = new THREE.Box3().setFromObject(obj);

      // Check for intersection
      if (controllerBox.intersectsBox(objectBox)) {
        return obj;
      }
    }
  }
  return null;
}

function getWorldPositionAndRotation(object) {
  const worldPosition = new THREE.Vector3();
  object.getWorldPosition(worldPosition);

  const worldQuaternion = new THREE.Quaternion();
  object.getWorldQuaternion(worldQuaternion);

  // Convert quaternion to rotation
  const worldEuler = new THREE.Euler();
  worldEuler.setFromQuaternion(worldQuaternion, 'xyz');

  return {
    position: worldPosition,
    rotation: worldEuler,
    quaternion: worldQuaternion,
  };
}
function getOffsetsBetweenObjects(object1, object2) {
  const object1Position = new THREE.Vector3();
  object1.getWorldPosition(object1Position);
  const object2Position = new THREE.Vector3();
  object2.getWorldPosition(object2Position);
  // Offset location from object1 to object2 in world space
  const offsetVector = new THREE.Vector3().subVectors(object2Position, object1Position);

  const object1Quaternion = new THREE.Quaternion();
  object1.getWorldQuaternion(object1Quaternion);
  const object2Quaternion = new THREE.Quaternion();
  object2.getWorldQuaternion(object2Quaternion);
  // Offset quaternion from object1 to object2 in world space
  const relativeQuaternion = object1Quaternion.clone().invert().multiply(object2Quaternion);

  const relativeRotation = new THREE.Euler();
  relativeRotation.setFromQuaternion(relativeQuaternion, 'xyz');

  return {
    rotationOffset: relativeRotation,
    positionOffset: offsetVector,
    quaternionOffset: relativeQuaternion,
  };
}
