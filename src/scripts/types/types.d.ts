import type * as THREE from 'three'; //Three.js
import type { GamepadWrapper } from 'gamepad-wrapper'; //Gamepad input controls
import type Stats from Stats.js

declare global{
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
  stats: Stats;
};
export type Controllers ={
    left?: ControllerType | undefined; 
    right?: ControllerType | undefined;
    none?: ControllerType | undefined;
}
export type ControllerType = {
  raySpace: THREE.Object3D;
  gripSpace: THREE.Object3D;
  mesh: THREE.Object3D;
  heldItem: THREE.Object3D | undefined;
  gamepad: GamepadWrapper;
};
export type ObjectInfo = {
  position?: THREE.Vector3 | undefined;
  rotation?: THREE.Euler | undefined;
  width?: number | undefined;
  height?: number | undefined;
  depth?: number | undefined;
  parameters?: THREE.MeshBasicMaterialParameters
}
export type TextInfo = {
  text?: string;
  fontWeight?: number;
  fontSize?: number;
  color?: THREE.ColorRepresentation | undefined;
  anchorX?: number | string | undefined;
  innerTextAlign?: 'left' | 'right' | 'center' | 'justify' | undefined;
  justification?: 'start' | 'center' | 'end' | undefined;
  alignment?: 'start' | 'center' | 'end' | undefined;
  anchorY?: number | string | undefined;
}
}
export {}; //To make module