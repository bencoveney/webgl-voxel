/// <reference types="three" />
// @ts-check

function initScene() {
  return new THREE.Scene();
}

const gridSize = 16;
const debug = false;

function initCamera() {
  var aspect = window.innerWidth / window.innerHeight;
  var d = 30;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d);
  camera.position.set(0, 100, 0);
  camera.rotation.order = "YXZ";
  camera.rotation.y = -Math.PI / 4;
  camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
  return camera;
}

function initRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  window.document.body.appendChild(renderer.domElement);
  return renderer;
}

function createColor({ r, g, b }) {
  return `rgb(${r}, ${g}, ${b})`;
}

const materialCache = {};

function createMaterial(color) {
  if (materialCache[color]) {
    return materialCache[color];
  }

  let material = debug
    ? new THREE.LineBasicMaterial({
        color,
        linewidth: 1,
        depthTest: false,
        transparent: true
      })
    : new THREE.MeshLambertMaterial({ color });

  materialCache[color] = material;

  return material;
}

function createMesh(geometry, material) {
  if (debug) {
    const wireframe = new THREE.WireframeGeometry(geometry);
    return new THREE.LineSegments(wireframe, material);
  } else {
    return new THREE.Mesh(geometry, material);
  }
}

const geometryCache = {};

function createGeometry(width, height) {
  if (geometryCache[width] === undefined) {
    geometryCache[width] = {}
  }

  if (geometryCache[width][height] === undefined) {
    geometryCache[width][height] = new THREE.PlaneBufferGeometry(width, height)
  }

  return geometryCache[width][height];
}

const quarterTurn = Math.PI / 2;
const halfTurn = Math.PI;

function createFace({ x, y, z, color, width, height }, dx, dy, dz, side) {
  const material = createMaterial(color);
  const geometry = createGeometry(width, height);
  const mesh = createMesh(geometry, material);
  switch (side) {
    case "left":
      mesh.rotateY(-quarterTurn);
      mesh.position.set(x + dx - 0.5, y + dy + (0.5 * height) - 0.5, z + dz + (0.5 * width) - 0.5);
      break;
    case "right":
      mesh.rotateY(quarterTurn);
      mesh.position.set(x + dx + 0.5, y + dy + (0.5 * height) - 0.5, z + dz + (0.5 * width) - 0.5);
      break;
    case "bottom":
      mesh.rotateX(quarterTurn);
      mesh.position.set(x + dx + (0.5 * width) - 0.5, y + dy - 0.5, z + dz + (0.5 * height) - 0.5);
      break;
    case "top":
      mesh.rotateX(-quarterTurn);
      mesh.position.set(x + dx + (0.5 * width) - 0.5, y + dy + 0.5, z + dz + (0.5 * height) - 0.5);
      break;
    case "back":
      mesh.rotateX(halfTurn);
      mesh.position.set(x + dx + (0.5 * width) - 0.5, y + dy + (0.5 * height) - 0.5, z + dz - 0.5);
      break;
    case "front":
      mesh.position.set(x + dx + (0.5 * width) - 0.5, y + dy + (0.5 * height) - 0.5, z + dz + 0.5);
      break;
  }
  return mesh;
}

function createLight() {
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(gridSize * 1.5, 32, gridSize * 1.5);
  return light;
}

function createModelAt(model, scene, x, y, z) {
  function createSides(voxels, side) {
    voxels.forEach(definition => {
      const voxel = createFace(
        definition,
        x * gridSize,
        y * gridSize,
        z * gridSize,
        side
      );
      scene.add(voxel);
    });
  }

  createSides(model.leftFaces, "left");
  createSides(model.rightFaces, "right");
  createSides(model.topFaces, "top");
  createSides(model.bottomFaces, "bottom");
  createSides(model.frontFaces, "front");
  createSides(model.backFaces, "back");
}

Promise.all(
  ["brick1", "grass1", "small_tree", "tall_grass", "woodcutter"].map(loadModel)
).then(([brick1, grass1, smallTree, tallGrass, woodcutter]) => {
  const scene = initScene();
  const camera = initCamera();
  const renderer = initRenderer();

  scene.add(new THREE.AmbientLight(0x404040));

  // @ts-ignore
  var controls = new THREE.OrbitControls(camera);
  camera.position.set(gridSize * 1.5, 20, gridSize * 1.5);
  controls.update();

  for (let x = 0; x < 3; x++) {
    for (let z = 0; z < 3; z++) {
      createModelAt(grass1, scene, 1 - x, -1, 1 - z);
    }
  }

  createModelAt(woodcutter, scene, 0, 0, 0);
  createModelAt(smallTree, scene, -1, 0, 1);
  createModelAt(brick1, scene, -1, 0, -1);
  createModelAt(tallGrass, scene, 1, 0, -1);

  const light = createLight();
  scene.add(light);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
});

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

function loadModel(name) {
  const path = `./src/models/${name}.png`;

  console.time(`${path}: loading`);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = path;
    image.onload = () => resolve(image);
  }).then(image => {
    console.timeEnd(`${path}: loading`);
    console.time(`${path}: reading`);

    const size = image.naturalWidth;

    if (image.naturalHeight != size * size) {
      throw new Error(`${path} is not a cube`);
    }

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
    const imageData = context.getImageData(
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    ).data;

    const model = {
      name,
      path,
      size,
      voxels: [],
      visible: [],

      topVisible: [],
      bottomVisible: [],
      leftVisible: [],
      rightVisible: [],
      backVisible: [],
      frontVisible: [],

      topFaces: [],
      bottomFaces: [],
      leftFaces: [],
      rightFaces: [],
      backFaces: [],
      frontFaces: []
    };

    const partsPerPixel = 4;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
          const pixelIndex = x + z * size + y * size * size;
          const imageDataIndex = pixelIndex * partsPerPixel;
          const [r, g, b, a] = imageData.slice(
            imageDataIndex,
            imageDataIndex + partsPerPixel
          );

          if (a !== 0) {
            model.voxels.push({ x, y: size - (y + 1), z, r, g, b });
          }
        }
      }
    }

    console.timeEnd(`${path}: reading`);

    console.time(`${path}: finding visible faces`);

    function isVoxel(x1, y1, z1) {
      return model.voxels.some(({ x, y, z }) => x1 == x && y1 == y && z1 == z);
    }

    // TODO: Edges will always be visible.

    model.voxels.forEach(voxel => {
      const { x, y, z } = voxel;

      const leftVisible = !isVoxel(x - 1, y, z);
      if (leftVisible) {
        model.leftVisible.push(voxel);
      }

      const rightVisible = !isVoxel(x + 1, y, z);
      if (rightVisible) {
        model.rightVisible.push(voxel);
      }

      const bottomVisible = !isVoxel(x, y - 1, z);
      if (bottomVisible) {
        model.bottomVisible.push(voxel);
      }

      const topVisible = !isVoxel(x, y + 1, z);
      if (topVisible) {
        model.topVisible.push(voxel);
      }

      const backVisible = !isVoxel(x, y, z - 1);
      if (backVisible) {
        model.backVisible.push(voxel);
      }

      const frontVisible = !isVoxel(x, y, z + 1);
      if (frontVisible) {
        model.frontVisible.push(voxel);
      }

      if (
        leftVisible ||
        rightVisible ||
        bottomVisible ||
        topVisible ||
        backVisible ||
        frontVisible
      ) {
        model.visible.push(voxel);
      }
    });

    console.timeEnd(`${path}: finding visible faces`);

    console.time(`${path}: combining visible faces`);

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
          const topVoxel = getVoxel(model.topVisible, x, y, z);
          if (topVoxel) {
            topMask[x][z] = createColor(topVoxel);
          }

          const bottomVoxel = getVoxel(model.bottomVisible, x, y, z);
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
          const leftVoxel = getVoxel(model.leftVisible, x, y, z);
          if (leftVoxel) {
            leftMask[y][z] = createColor(leftVoxel);
          }

          const rightVoxel = getVoxel(model.rightVisible, x, y, z);
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
          const frontVoxel = getVoxel(model.frontVisible, x, y, z);
          if (frontVoxel) {
            frontMask[x][y] = createColor(frontVoxel);
          }

          const backVoxel = getVoxel(model.backVisible, x, y, z);
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

    console.timeEnd(`${path}: combining visible faces`);

    console.log(
      `${model.voxels.length} voxels (${model.voxels.length *
        6} faces) compressed to ${model.backFaces.length +
        model.bottomFaces.length +
        model.frontFaces.length +
        model.leftFaces.length +
        model.rightFaces.length +
        model.topFaces.length} faces`
    );

    return model;
  });
}
