/// <reference types="three" />
// @ts-check

function initScene() {
  return new THREE.Scene();
}

function initCamera() {
  var aspect = window.innerWidth / window.innerHeight;
  var d = 20;
  const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d);
  camera.position.set(0, 16, 16);
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

function createCube({ x, y, z, r, g, b }) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const color = `rgb(${r}, ${g}, ${b})`;
  const material = new THREE.MeshLambertMaterial({ color });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x - 8, y - 8, z - 8);
  return cube;
}

function createLight() {
  const light = new THREE.PointLight(0xffffff, 1, 100);
	light.position.set(8, 8, 8);
	return light;
}

loadModel("./src/models/woodcutter.png").then(model => {
  const scene = initScene();
  const camera = initCamera();
  const renderer = initRenderer();

  scene.add(new THREE.AmbientLight(0x404040));

  // @ts-ignore
  var controls = new THREE.OrbitControls(camera);
  controls.update();

  model.voxels.forEach(definition => {
    const voxel = createCube(definition);
    scene.add(voxel);
  });

  const light = createLight();
  scene.add(light);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
});

function loadModel(path) {
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
