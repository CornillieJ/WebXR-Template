import type {Sizes, ControllerType, Controllers, Globals }  from './types.ts'

import * as THREE from 'three'; //import Three.js

export function checkControllerOverlap(controller : ControllerType , interactableObjects : THREE.Object3D[]) : THREE.Object3D | undefined {
  // Update bounding box for controller mesh
  const controllerBox = new THREE.Box3().setFromObject(controller.mesh);

  for (const obj of interactableObjects) {
    if (obj && obj instanceof THREE.Mesh) {
      // Update bounding box for object
      const objectBox = new THREE.Box3().setFromObject(obj);

      // Check for intersection
      if (controllerBox.intersectsBox(objectBox)) {
        return obj;
      }
    }
  }
  return undefined;
}

export function getWorldPositionAndRotation(object : THREE.Object3D) 
: {position: THREE.Vector3; rotation: THREE.Euler; quaternion: THREE.Quaternion} {
  const worldPosition = new THREE.Vector3();
  object.getWorldPosition(worldPosition);

  const worldQuaternion = new THREE.Quaternion();
  object.getWorldQuaternion(worldQuaternion);

  // Convert quaternion to rotation
  const worldEuler = new THREE.Euler();
  worldEuler.setFromQuaternion(worldQuaternion, 'XYZ' as THREE.EulerOrder);

  return {
    position: worldPosition,
    rotation: worldEuler,
    quaternion: worldQuaternion,
  };
}

export function getOffsetsBetweenObjects(startObject : THREE.Object3D, object2 : THREE.Object3D) 
: {positionOffset: THREE.Vector3; rotationOffset: THREE.Euler; quaternionOffset: THREE.Quaternion} {
  const startObjectPosition = new THREE.Vector3();
  startObject.getWorldPosition(startObjectPosition);
  const object2Position = new THREE.Vector3();
  object2.getWorldPosition(object2Position);
  // Offset location from startObject to object2 in world space
  const offsetVector = startObject.worldToLocal(object2Position);


  const startObjectQuaternion = new THREE.Quaternion();
  startObject.getWorldQuaternion(startObjectQuaternion);
  const object2Quaternion = new THREE.Quaternion();
  object2.getWorldQuaternion(object2Quaternion);
  // Offset quaternion from startObject to object2 in world space
  const relativeQuaternion = startObjectQuaternion.clone().invert().multiply(object2Quaternion);

  const relativeRotation = new THREE.Euler();
  relativeRotation.setFromQuaternion(relativeQuaternion, 'XYZ' as THREE.EulerOrder);

  return {
    positionOffset: offsetVector,
    rotationOffset: relativeRotation,
    quaternionOffset: relativeQuaternion,
  };
}

export function exists(item : THREE.Object3D | undefined) : boolean{
  return item !== undefined;
}
export function isItemHeld(controller : ControllerType) : boolean{
  return controller.heldItem !== undefined;
}

export function getInteractableObjects(scene : THREE.Scene) : THREE.Object3D[]{
  const interactableObjects : THREE.Object3D[] = [];
  scene.traverse((object) => {
    if (object.userData && object.userData.interactable) {
      interactableObjects.push(object);
    }
  });
  return interactableObjects;
}