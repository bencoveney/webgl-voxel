export interface Color {
  r: number;
  g: number;
  b: number;
}

// https://en.wikipedia.org/wiki/Web_colors#Hex_triplet

export function toHexTriplet({ r, g, b }: Color): number {
  return (1 << 24) + (r << 16) + (g << 8) + b;
}

export function fromHexTriplet(hexTriplet: number): Color {
  return {
    r: hexTriplet >> 16,
    g: (hexTriplet >> 8) & 255,
    b: hexTriplet & 255
  };
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 extends Vector2 {
  z: number;
}

export function distanceManhattan3(from: Vector3, to: Vector3) {
  const dX = Math.abs(to.x - from.x);
  const dY = Math.abs(to.y - from.y);
  const dZ = Math.abs(to.z - from.z);
  return dX + dY + dZ;
}

export function distanceEuclidean3(from: Vector3, to: Vector3) {
  const x = Math.abs(to.x - from.x);
  const y = Math.abs(to.y - from.y);
  const z = Math.abs(to.z - from.z);
  return Math.sqrt((x * x) + (y * y) + (z * z))
}

export type LookupData<Index extends number> = { [key in Index]: number } &
  Uint8Array;

export type Mask2d = Array<Array<number>>;

export function createMask2d(size: number): Mask2d {
  const array = [];
  for (let x = 0; x < size; x++) {
    const row = [];
    for (let y = 0; y < size; y++) {
      row.push(undefined);
    }
    array.push(row);
  }
  return array;
}

export type Mask3d<Value = number> = Array<Array<Array<Value>>>;

export function createMask3d<Value = number>(xSize: number, ySize: number, zSize: number): Mask3d<Value> {
  const array = [];
  for (let x = 0; x < xSize; x++) {
    const xContent = [];
    for (let y = 0; y < ySize; y++) {
      const yContent = [];
      for (let z = 0; z < zSize; z++) {
        yContent.push(undefined);
      }
      xContent.push(yContent);
    }
    array.push(xContent);
  }
  return array;
}

export function mask3dGet<Value>(mask3d: Mask3d<Value>, x: number, y: number, z: number): Value {
  let xContent = mask3d[x];

  if (xContent === undefined) {
    return undefined;
  }

  let yContent = xContent[y];

  if (yContent === undefined) {
    return undefined;
  }

  return yContent[z];
}
