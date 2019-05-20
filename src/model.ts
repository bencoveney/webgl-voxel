interface Model {
  name: string;
  path: string;
  size: number;
  voxels: Voxel[];

  topFaces: Face[];
  bottomFaces: Face[];
  leftFaces: Face[];
  rightFaces: Face[];
  backFaces: Face[];
  frontFaces: Face[];
}

interface Voxel {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
}

interface Face {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  color: string;
}

export function loadModel(name: string): Promise<Model> {
  const path = `./src/models/${name}.png`;

  console.time(`${path}: loading`);

  return loadImageData(path).then(({ size, data }) => {
    const voxels = getVoxels({ size, data });

    const model: Model = {
      name,
      path,
      size,
      voxels,

      topFaces: [],
      bottomFaces: [],
      leftFaces: [],
      rightFaces: [],
      backFaces: [],
      frontFaces: []
    };

    console.timeEnd(`${path}: loading`);

    console.time(`${path}: optimising`);

    optimizeModel(model, size);

    console.timeEnd(`${path}: optimising`);

    const numberOfFaces =
      model.backFaces.length +
      model.bottomFaces.length +
      model.frontFaces.length +
      model.leftFaces.length +
      model.rightFaces.length +
      model.topFaces.length;

    console.log(
      `${path}: ${
        model.voxels.length
      } voxels compressed to ${numberOfFaces} faces`
    );

    return model;
  });
}

function createColor({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

function create2dArray(size1, size2, value) {
  const array = [];
  for (let j = 0; j < size1; j++) {
    const row = [];
    for (let k = 0; k < size2; k++) {
      row.push(value);
    }
    array.push(row);
  }
  return array;
}

interface ImageData {
  size: number;
  data: Uint8ClampedArray;
}

function loadImageData(path: string): Promise<ImageData> {
  return new Promise<HTMLImageElement>(resolve => {
    const image = new Image();
    image.src = path;
    image.onload = () => resolve(image);
  }).then(image => {
    const size = image.naturalWidth;

    if (image.naturalHeight != size * size) {
      throw new Error(`${path} is not a cube`);
    }

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    const data = context.getImageData(
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    ).data;

    return { data, size };
  });
}

function getVoxels({ size, data }: ImageData): Voxel[] {
  const result: Voxel[] = [];

  const partsPerPixel = 4;
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        const pixelIndex = x + z * size + y * size * size;
        const imageDataIndex = pixelIndex * partsPerPixel;
        const [r, g, b, a] = data.slice(
          imageDataIndex,
          imageDataIndex + partsPerPixel
        );

        if (a !== 0) {
          result.push({ x, y: size - (y + 1), z, r, g, b });
        }
      }
    }
  }

  return result;
}

function optimizeModel(model: Model, size: number) {
	const topVisible: Voxel[] = [];
	const bottomVisible: Voxel[] = [];
	const leftVisible: Voxel[] = [];
	const rightVisible: Voxel[] = [];
	const backVisible: Voxel[] = [];
	const frontVisible: Voxel[] = [];

  function isVoxel(x1, y1, z1) {
    return model.voxels.some(({ x, y, z }) => x1 == x && y1 == y && z1 == z);
  }

  model.voxels.forEach(voxel => {
    const { x, y, z } = voxel;

    if (!isVoxel(x - 1, y, z)) {
      leftVisible.push(voxel);
    }

    if (!isVoxel(x + 1, y, z)) {
      rightVisible.push(voxel);
    }

    if (!isVoxel(x, y - 1, z)) {
      bottomVisible.push(voxel);
    }

    if (!isVoxel(x, y + 1, z)) {
      topVisible.push(voxel);
    }

    if (!isVoxel(x, y, z - 1)) {
      backVisible.push(voxel);
    }

    if (!isVoxel(x, y, z + 1)) {
      frontVisible.push(voxel);
    }
  });

  function getVoxel(voxels, x1, y1, z1) {
    const matches = voxels.filter(
      ({ x, y, z }) => x1 == x && y1 == y && z1 == z
    );
    return matches.length > 0 ? matches[0] : undefined;
  }

  // Tops/bottoms
  for (let y = 0; y < size; y++) {
    const topMask = create2dArray(size, size, "");
    const bottomMask = create2dArray(size, size, "");
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const topVoxel = getVoxel(topVisible, x, y, z);
        if (topVoxel) {
          topMask[x][z] = createColor(topVoxel);
        }

        const bottomVoxel = getVoxel(bottomVisible, x, y, z);
        if (bottomVoxel) {
          bottomMask[x][z] = createColor(bottomVoxel);
        }
      }
    }

    function combineFaces(mask, target) {
      for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
          // Starting point
          const color = mask[x][z];
          if (color !== "") {
            mask[x][z] = "";
            let width = 1;
            let canExpandWidth = true;
            while (canExpandWidth) {
              const nextWidth = width + 1;
              const xToCheck = x + nextWidth - 1;

              if (xToCheck >= size) {
                canExpandWidth = false;
              } else if (mask[xToCheck][z] === color) {
                width = nextWidth;
                mask[xToCheck][z] = "";
              } else {
                canExpandWidth = false;
              }
            }

            let depth = 1;
            let canExpandDepth = true;
            while (canExpandDepth) {
              const nextDepth = depth + 1;
              const zToCheck = z + nextDepth - 1;

              if (zToCheck >= size) {
                canExpandDepth = false;
              } else {
                let nextRowMatches = true;
                for (let i = 0; i < width; i++) {
                  if (mask[x + i][zToCheck] !== color) {
                    nextRowMatches = false;
                  }
                }

                if (nextRowMatches) {
                  depth = nextDepth;
                  for (let i = 0; i < width; i++) {
                    mask[x + i][zToCheck] = "";
                  }
                } else {
                  canExpandDepth = false;
                }
              }
            }

            target.push({
              x,
              y,
              z,
              width,
              height: depth,
              color
            });
          }
        }
      }
    }

    combineFaces(topMask, model.topFaces);
    combineFaces(bottomMask, model.bottomFaces);
  }

  // Lefts/rights
  for (let x = 0; x < size; x++) {
    const leftMask = create2dArray(size, size, "");
    const rightMask = create2dArray(size, size, "");
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < size; z++) {
        const leftVoxel = getVoxel(leftVisible, x, y, z);
        if (leftVoxel) {
          leftMask[y][z] = createColor(leftVoxel);
        }

        const rightVoxel = getVoxel(rightVisible, x, y, z);
        if (rightVoxel) {
          rightMask[y][z] = createColor(rightVoxel);
        }
      }
    }

    function combineFaces(mask, target) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          // Starting point
          const color = mask[y][z];
          if (color !== "") {
            mask[y][z] = "";
            let height = 1;
            let canExpandHeight = true;
            while (canExpandHeight) {
              const nextHeight = height + 1;
              const yToCheck = y + nextHeight - 1;

              if (yToCheck >= size) {
                canExpandHeight = false;
              } else if (mask[yToCheck][z] === color) {
                height = nextHeight;
                mask[yToCheck][z] = "";
              } else {
                canExpandHeight = false;
              }
            }

            let depth = 1;
            let canExpandDepth = true;
            while (canExpandDepth) {
              const nextDepth = depth + 1;
              const zToCheck = z + nextDepth - 1;

              if (zToCheck >= size) {
                canExpandDepth = false;
              } else {
                let nextRowMatches = true;
                for (let i = 0; i < height; i++) {
                  if (mask[y + i][zToCheck] !== color) {
                    nextRowMatches = false;
                  }
                }

                if (nextRowMatches) {
                  depth = nextDepth;
                  for (let i = 0; i < height; i++) {
                    mask[y + i][zToCheck] = "";
                  }
                } else {
                  canExpandDepth = false;
                }
              }
            }

            target.push({
              x,
              y,
              z,
              width: depth,
              height,
              color
            });
          }
        }
      }
    }

    combineFaces(leftMask, model.leftFaces);
    combineFaces(rightMask, model.rightFaces);
  }

  // Fronts/backs
  for (let z = 0; z < size; z++) {
    const frontMask = create2dArray(size, size, "");
    const backMask = create2dArray(size, size, "");
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const frontVoxel = getVoxel(frontVisible, x, y, z);
        if (frontVoxel) {
          frontMask[x][y] = createColor(frontVoxel);
        }

        const backVoxel = getVoxel(backVisible, x, y, z);
        if (backVoxel) {
          backMask[x][y] = createColor(backVoxel);
        }
      }
    }

    function combineFaces(mask, target) {
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          // Starting point
          const color = mask[x][y];
          if (color !== "") {
            mask[x][y] = "";
            let width = 1;
            let canExpandWidth = true;
            while (canExpandWidth) {
              const nextWidth = width + 1;
              const xToCheck = x + nextWidth - 1;

              if (xToCheck >= size) {
                canExpandWidth = false;
              } else if (mask[xToCheck][y] === color) {
                width = nextWidth;
                mask[xToCheck][y] = "";
              } else {
                canExpandWidth = false;
              }
            }

            let height = 1;
            let canExpandHeight = true;
            while (canExpandHeight) {
              const nextHeight = height + 1;
              const yToCheck = y + nextHeight - 1;

              if (yToCheck >= size) {
                canExpandHeight = false;
              } else {
                let nextRowMatches = true;
                for (let i = 0; i < width; i++) {
                  if (mask[x + i][yToCheck] !== color) {
                    nextRowMatches = false;
                  }
                }

                if (nextRowMatches) {
                  height = nextHeight;
                  for (let i = 0; i < width; i++) {
                    mask[x + i][yToCheck] = "";
                  }
                } else {
                  canExpandHeight = false;
                }
              }
            }

            target.push({
              x,
              y,
              z,
              width,
              height,
              color
            });
          }
        }
      }
    }

    combineFaces(frontMask, model.frontFaces);
    combineFaces(backMask, model.backFaces);
  }
}
