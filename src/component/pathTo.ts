export interface PathTo {
  x: number;
  y: number;
  z: number;
}

export function pathToFactory(): PathTo {
  return { x: 0, y: 0, z: 0 };
}
