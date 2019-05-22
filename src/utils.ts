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

export type Mask3d = Array<Array<Array<number>>>;

export function createMask3d(size: number): Mask3d {
  const array = [];
  for (let x = 0; x < size; x++) {
    const xContent = [];
    for (let y = 0; y < size; y++) {
      const yContent = [];
      for (let z = 0; z < size; z++) {
        yContent.push(undefined);
      }
      array.push(yContent);
    }
    array.push(xContent);
  }
  return array;
}
