export interface Position {
  x: number;
  y: number;
  z: number;
}

export function positionFactory(): Position {
  return { x: 0, y: 0, z: 0 };
}
