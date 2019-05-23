interface CanWalk {
  canWalk: true;
  walkSpeed: number;
}

interface CanNotWalk {
  canWalk: false;
}

export type Walk = CanWalk | CanNotWalk

export function walkFactory(): Walk {
  return { canWalk: false };
}
