import * as THREE from 'three'; //Three.js
import { GamepadWrapper } from 'gamepad-wrapper'; //Gamepad input controls


export type Sizes = {
  width: number;
  height: number;
};

export type Globals = {
  canvas: HTMLCanvasElement;
  scene: THREE.Scene;
  sizes: Sizes;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  player: THREE.Group;
  controllers: Controllers;
};
export type Controllers ={
    left?: ControllerType; 
    right?: ControllerType;
    none?: ControllerType;
}
export type ControllerType = {
  raySpace: THREE.Object3D;
  gripSpace: THREE.Object3D;
  mesh: THREE.Object3D;
  heldItem: THREE.Object3D | undefined;
  gamepad: GamepadWrapper;
};
