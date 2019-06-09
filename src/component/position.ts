import { Vector3 } from "../utils";

export const enum Rotation {
  TURN_0 = 0,
  TURN_1 = 1,
  TURN_2 = 2,
  TURN_3 = 3
}

export interface Position extends Vector3 {
  rotation: Rotation;
}

export function positionFactory(): Position {
  return { x: 0, y: 0, z: 0, rotation: Rotation.TURN_0 };
}
