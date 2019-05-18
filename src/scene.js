/// <reference types="three" />
// @ts-check

function initScene() {
  return new THREE.Scene();
}

const gridSize = 16;

function initCamera() {
  var aspect = window.innerWidth / window.innerHeight;
  var d = 20;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d);
  camera.position.set(0, 100, 0);
  camera.rotation.order = "YXZ";
  camera.rotation.y = -Math.PI / 4;
  camera.rotation.x = Math.atan(-1 / Math.sqrt(2));
  return camera;
}

function initRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  console.log("size", window.innerWidth, window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.document.body.appendChild(renderer.domElement);
  return renderer;
}

function createCube({ x, y, z, r, g, b }, dx, dy, dz) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const color = `rgb(${r}, ${g}, ${b})`;
  const material = new THREE.MeshLambertMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x + dx, y + dy, z + dz);
  return cube;
}

function createLight() {
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(gridSize * 1.5, 32, gridSize * 1.5);
  return light;
}

function createModelAt(model, scene, x, y, z) {
  model.voxels.forEach(definition => {
    const voxel = createCube(definition, x * gridSize, y * gridSize, z * gridSize);
    scene.add(voxel);
  });
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
  camera.position.set(gridSize * 1.5, 20, gridSize * 1.5)
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

function loadModel(name) {
  const path = `./src/models/${name}.png`;

  console.time(`loading ${path}`);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = path;
    image.onload = () => {
      console.timeEnd(`loading ${path}`);
      console.time(`reading ${path}`);

      const size = image.naturalWidth;

      if (image.naturalHeight != size * size) {
        return reject(`${path} is not a cube`);
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
        voxels: []
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
              model.voxels.push({ x, y: 16 - y, z, r, g, b });
            }
          }
        }
      }

      console.timeEnd(`reading ${path}`);

      console.log(model);

      resolve(model);
    };
  });
}
