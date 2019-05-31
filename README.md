# webgl-voxel

Playing with voxels in webgl using Three.js - [Demo](https://bencoveney.github.io/webgl-voxel/). Models made using [MagicaVoxel](https://ephtracy.github.io/).

![Voxel engine screenshot](https://raw.githubusercontent.com/bencoveney/webgl-voxel/master/screenshot.png)

## Voxel Model Loading

- *Load image*
- **Sprite**: `.png` data
- *Parse image*
- **Voxels**: `x, y, z, r, g, b` data
- TODO: *Group static voxels into bigger sets*
- *Calculate + combine visible sides of voxels*
- **Faces**: face data - `x, y, z, rotation, width, height, r, g, b`
- *Create ThreeJS mesh*
- **THREE.Mesh**