export interface Terrain {
  walkSpeed: number;
}

export function terrainFactory(): Terrain {
  return { walkSpeed: 1 };
}
