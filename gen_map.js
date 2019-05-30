const fs = require("fs");
const path = require("path");

const files = fs
  .readdirSync("./src/models")
  .filter(name => name.startsWith("terrain-"))
  .map(name => path.basename(name, ".png"));

let world = [];

function setAtPosition(x, y, z, rotation, name) {
  world = world
    .filter(
      model =>
        !(
          model.position.x === x &&
          model.position.y === y &&
          model.position.z === z
        )
    )
    .concat([{ position: { x, y, z, rotation }, sprite: { name } }]);
}

// World floor
for (let x = 0; x < 10; x++) {
  for (let z = 0; z < 10; z++) {
    setAtPosition(x, 0, z, 0, "grass");
  }
}

// Raised floor
for (let x = 6; x < 10; x++) {
  for (let z = 0; z < 3; z++) {
    setAtPosition(x, 1, z, 0, "grass");
  }
}
for (let x = 4; x < 10; x++) {
  for (let z = 0; z < 1; z++) {
    setAtPosition(x, 1, z, 0, "grass");
  }
}

// Lake floor
for (let x = 6; x < 10; x++) {
  for (let z = 6; z < 10; z++) {
    setAtPosition(x, 0, z, 0, "lake");
  }
}
for (let x = 4; x < 10; x++) {
  for (let z = 8; z < 10; z++) {
    setAtPosition(x, 0, z, 0, "lake");
  }
}

// Cliff edges
setAtPosition(4, 1, 0, 2, "cliff_corner_outer");
setAtPosition(5, 1, 0, 3, "cliff_straight");
setAtPosition(6, 1, 0, 2, "cliff_corner_inner");
setAtPosition(6, 1, 1, 2, "cliff_straight");
setAtPosition(6, 1, 2, 2, "cliff_corner_outer");
setAtPosition(8, 1, 2, 3, "cliff_straight");
setAtPosition(9, 1, 2, 3, "cliff_straight");

// Stream
setAtPosition(7, 0, 2, 3, "waterfall_base");
setAtPosition(7, 0, 3, 3, "stream_straight");
setAtPosition(7, 0, 4, 3, "stream_stone_bridge");
setAtPosition(7, 0, 5, 3, "stream_straight");
setAtPosition(7, 0, 6, 3, "lake_entry");

setAtPosition(7, 1, 0, 3, "stream_straight");
setAtPosition(7, 1, 1, 3, "stream_stepping_stones");
setAtPosition(7, 1, 2, 3, "waterfall_top");

// Lake edge
setAtPosition(4, 0, 9, 0, "lake_edge_straight");
setAtPosition(4, 0, 8, 3, "lake_edge_inner");
setAtPosition(5, 0, 8, 3, "lake_edge_straight");
setAtPosition(6, 0, 8, 3, "lake_edge_outer");
setAtPosition(6, 0, 7, 0, "lake_edge_pier");
setAtPosition(6, 0, 6, 3, "lake_edge_inner");
setAtPosition(8, 0, 6, 3, "lake_edge_straight");
setAtPosition(9, 0, 6, 3, "lake_edge_straight");

setAtPosition(8, 0, 8, 1, "lake_boat");
setAtPosition(6, 0, 9, 0, "lake_lilly");

// Castle
function createCastleSection(
  x,
  z,
  rotation,
  base,
  bottom,
  mid,
  top,
  crenellations
) {
  setAtPosition(x, 0, z, rotation, base);
  setAtPosition(x, 1, z, rotation, bottom);
  setAtPosition(x, 2, z, rotation, mid);
  setAtPosition(x, 3, z, rotation, top);
  setAtPosition(x, 4, z, rotation, crenellations);
}

function createCastleCorner(x, z, rotation) {
  createCastleSection(
    x,
    z,
    rotation,
    "castle_outer_base",
    "castle_outer_wall_bottom",
    "castle_outer_wall_mid",
    "castle_outer_wall_top",
    "castle_outer_crenellation"
  );
}

createCastleCorner(0, 2, 1);
createCastleCorner(4, 2, 0);
createCastleCorner(4, 6, 3);
createCastleCorner(0, 6, 2);

function createCastleWall(x, z, rotation) {
  createCastleSection(
    x,
    z,
    rotation,
    "castle_straight_base",
    "castle_straight_wall_bottom",
    "castle_straight_wall_mid",
    "castle_straight_wall_top",
    "castle_straight_crenellation"
  );
}

function createCastleWindow(x, z, rotation) {
  createCastleSection(
    x,
    z,
    rotation,
    "castle_straight_base",
    "castle_window_bottom",
    "castle_window_top",
    "castle_straight_wall_top",
    "castle_straight_crenellation"
  );
}

function createCastleDoor(x, z, rotation) {
  createCastleSection(
    x,
    z,
    rotation,
    "castle_arch_base",
    "castle_arch_bottom",
    "castle_arch_top",
    "castle_straight_wall_top",
    "castle_straight_crenellation"
  );
}

createCastleWall(1, 2, 1);
createCastleWindow(2, 2, 1);
createCastleWall(3, 2, 1);

createCastleWall(4, 3, 0);
createCastleDoor(4, 4, 0);
createCastleWall(4, 5, 0);

createCastleWall(3, 6, 3);
createCastleWindow(2, 6, 3);
createCastleWall(1, 6, 3);

createCastleWall(0, 5, 2);
createCastleWindow(0, 4, 2);
createCastleWall(0, 3, 2);

for (let x = 1; x < 4; x++) {
  for (let z = 3; z < 6; z++) {
    setAtPosition(x, 0, z, 0, "castle_base");
    setAtPosition(x, 3, z, 0, "castle_roof");
  }
}

// Path
setAtPosition(5, 0, 4, 0, "stone_path_straight");
setAtPosition(6, 0, 4, 0, "stone_path_straight");
setAtPosition(8, 0, 4, 0, "stone_path_straight");
setAtPosition(9, 0, 4, 0, "stone_path_straight");

function getSpriteName(name) {
  const found = files.filter(file => file.endsWith(name));
  if (found.length !== 1) {
    throw new Error("Could not find " + name);
  }
  return found[0];
}

let id = 0;

const walkableTiles = [
  "castle_base",
  "castle_roof",
  "castle_arch_base",
  "lake_edge_pier",
  "cliff_corner_inner",
  "cliff_corner_outer",
  "cliff_straight",
  "stone_path_end",
  "stream_stone_bridge",
  "stone_path_corner",
  "stone_path_straight",
  "dirt_path_end",
  "dirt_path_corner",
  "dirt_path_straight",
  "stream_wood_bridge",
  "stream_stepping_stones",
  "grass"
];

const withIds = world.map(model => ({
  ...model,
  id: id++,
  position: {
    ...model.position,
    x: model.position.x - 5,
    z: model.position.z - 5
  },
  sprite: { name: getSpriteName(model.sprite.name) },
  terrain: {
    walkSpeed: walkableTiles.indexOf(model.sprite.name) !== -1 ? 1 : -1
  }
}));

withIds.push({
  id: id++,
  sprite: {
    name: "knight"
  },
  position: {
    x: 3,
    y: 1,
    z: 0
  },
  time_trigger: {
    frequency: "hourly",
    action: "moveToRandomLocation"
  }
});

const content = JSON.stringify(withIds, null, 2);
fs.writeFileSync("./src/world.json", content);
