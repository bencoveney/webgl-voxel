export interface Sprite {
  name: string;
}

const defaultSprite = "woodcutter";

export function spriteFactory(): Sprite {
  return { name: defaultSprite };
}
