import * as THREE from 'three'; //import Three.js
import * as HELPER from './helpers.js';

import { GamepadWrapper, XR_BUTTONS, XR_AXES } from 'gamepad-wrapper'; //Gamepad input controls
import { gsap } from 'gsap'; //Js library to simplify animation

export function addTemplateObjects(scene) {
  // Add die

  var loader = new THREE.TextureLoader();
  var diePaths = ['/die/1.jpg', '/die/6.jpg', '/die/5.jpg', '/die/2.jpg', '/die/3.jpg', '/die/4.jpg'];
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

export function addTemplateMovement(player, camera, controllers) {
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

export function addTemplateJump(player, controllers) {
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

export function addTemplateInteraction(scene, controllers) {
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
      const intersectedObject = HELPER.checkControllerOverlap(controller, interactableObjects);

      if (intersectedObject && !controller.mesh.userData?.grabbedObject) {
        const grabbedObject = intersectedObject;
        controller.mesh.userData.grabbedObject = grabbedObject;

        const offsetData = HELPER.getOffsetsBetweenObjects(controller.raySpace, grabbedObject);
        controller.raySpace.add(grabbedObject);
        grabbedObject.position.copy(offsetData.positionOffset);
        grabbedObject.quaternion.copy(offsetData.quaternionOffset);
      }
    }
    if (!grabHeld && controller.mesh.userData.grabbedObject) {
      const grabbedObject = controller.mesh.userData.grabbedObject;
      const locationData = HELPER.getWorldPositionAndRotation(grabbedObject);

      controller.raySpace.remove(grabbedObject);
      controller.mesh.userData.grabbedObject = null;

      grabbedObject.position.copy(locationData.position);
      grabbedObject.quaternion.copy(locationData.quaternion);
      scene.add(grabbedObject);
    }
  });
}
