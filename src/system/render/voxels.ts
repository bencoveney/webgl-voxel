export const enum VoxelLookup {
  exists = 0,

  r = 1,
  g = 2,
  b = 3,

  isLeftVisible = 4,
  isRightVisible = 5,
  isTopVisible = 6,
  isBottomVisible = 7,
  isFrontVisible = 8,
  isBackVisible = 9
}
const voxelLookupLength = 10;

export class Voxels {
  private data: Uint8Array;
  public length: number;
  public populatedOffsets: number[] = [];
  private sizeSquared: number;

  constructor(private readonly size: number) {
    this.length = size * size * size;
    this.sizeSquared = size * size;
    this.data = new Uint8Array(this.length * voxelLookupLength);
  }

  private isValid(x, y, z) {
    return (
      x >= 0 &&
      x < this.size &&
      y >= 0 &&
      y < this.size &&
      z >= 0 &&
      z < this.size
    );
  }

  private getOffset(x: number, y: number, z: number): number {
    return (x + this.size * y + this.sizeSquared * z) * voxelLookupLength;
  }

  getPosition(offset: number): { x: number; y: number; z: number } {
    const position = offset / voxelLookupLength;
    const x = position % this.size;
    const xRemainder = position - x;
    const y = (xRemainder / this.size) % this.size;
    const yRemainder = xRemainder - y * this.size;
    const z = (yRemainder / this.sizeSquared) % this.size;
    return { x, y, z };
  }

  _getByOffset(offset: number, lookup: VoxelLookup): number {
    return this.data[offset + lookup];
  }

  getByPos(x: number, y: number, z: number, lookup: VoxelLookup): number {
    return this.isValid(x, y, x)
      ? this.data[this.getOffset(x, y, z) + lookup]
      : undefined;
  }

  _existsByOffset(offset: number): boolean {
    return !!this.data[offset];
  }

  existsByPos(x: number, y: number, z: number): boolean {
    return this.isValid(x, y, x)
      ? !!this.data[this.getOffset(x, y, z) /* + VoxelLookup.Exists */]
      : undefined;
  }

  populate(x: number, y: number, z: number, r: number, g: number, b: number) {
    if (!this.isValid(x, y, x)) {
      throw new Error("Bad position");
    }
    const offset = this.getOffset(x, y, z);
    this.populatedOffsets.push(offset);
    this.data[offset + VoxelLookup.exists] = 1;
    this.data[offset + VoxelLookup.r] = r;
    this.data[offset + VoxelLookup.g] = g;
    this.data[offset + VoxelLookup.b] = b;
  }

  setByOffset(offset: number, lookup: VoxelLookup, value: number) {
    this.data[offset + lookup] = value;
  }

  _setByPos(
    x: number,
    y: number,
    z: number,
    lookup: VoxelLookup,
    value: number
  ) {
    if (!this.isValid(x, y, x)) {
      throw new Error("Bad position");
    }
    this.data[this.getOffset(x, y, z) + lookup] = value;
  }
}
