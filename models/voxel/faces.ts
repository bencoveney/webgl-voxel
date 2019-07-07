import { LookupData } from "./utils";

export interface Faces {
	topFaces: FaceData[];
	bottomFaces: FaceData[];
	leftFaces: FaceData[];
	rightFaces: FaceData[];
	backFaces: FaceData[];
	frontFaces: FaceData[];
}

export type FaceData = LookupData<FaceLookup>;

export const enum FaceLookup {
  x = 0,
  y = 1,
  z = 2,
  width = 3,
  height = 4,
  r = 5,
  g = 6,
  b = 7
}
