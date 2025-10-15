import type {Sizes, ControllerType, Controllers, Globals }  from './types.ts'

import * as THREE from 'three'; //import Three.js

export function checkControllerOverlap(controller : ControllerType , interactableObjects : THREE.Object3D[]) {
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
  return null;
}

export function getWorldPositionAndRotation(object : THREE.Object3D) {
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

export function getOffsetsBetweenObjects(object1 : THREE.Object3D, object2 : THREE.Object3D) {
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
  relativeRotation.setFromQuaternion(relativeQuaternion, 'XYZ' as THREE.EulerOrder);

  return {
    rotationOffset: relativeRotation,
    positionOffset: offsetVector,
    quaternionOffset: relativeQuaternion,
  };
}
