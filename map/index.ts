const fs = require("fs");
const path = require("path");

const files = fs
  .readdirSync("./src/models")
  .filter(name => name.startsWith("islands-"))
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

function getSpriteName(name) {
  const found = files.filter(file => file.endsWith(name));
  if (found.length !== 1) {
    throw new Error("Could not find " + name);
  }
  return found[0];
}

let id = 0;

const csv = `,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,,,,,,,grass,grass,grass,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,grass,grass,grass,grass,grass,grass,grass,grass,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,grass,grass,house,house,house,house,house,house,grass,grass,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,grass,grass,house,house,house,house,house,house,grass,grass,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,walkway,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,walkway,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,,,,grass,grass,grass,grass,grass,grass,,,,
,,,,,,,,,,,walkway,walkway,,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,,,grass,grass,grass,grass,grass,grass,grass,grass,,,
,,,,,,,,,,,walkway,walkway,,,grass,grass,grass,grass,house,house,house,house,grass,grass,grass,,,grass,house,house,house,house,house,house,grass,grass,,
,,,,,,,,,,,walkway,walkway,,,,grass,grass,grass,house,house,house,house,grass,grass,walkway,walkway,grass,grass,house,house,house,house,house,house,grass,grass,grass,
,,,,,,,,,,,walkway,walkway,,,,,grass,grass,grass,grass,grass,grass,grass,grass,walkway,walkway,grass,grass,house,house,house,house,house,house,grass,grass,grass,
,,,,,,,,,,,walkway,walkway,,,,,,grass,grass,grass,grass,grass,grass,,,,grass,grass,house,house,house,house,house,house,grass,grass,grass,
,,,,,,,,,,,walkway,walkway,,,,,,,,grass,grass,grass,,,,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,,,,grass,grass,,,,,,,grass,grass,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,walkway,grass,grass,grass,grass,grass,grass,grass,house,house,house,house,house,house,house,house,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,walkway,grass,grass,grass,grass,grass,grass,grass,house,house,house,house,house,house,house,house,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,,grass,grass,grass,grass,grass,grass,grass,house,house,house,house,house,house,house,house,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,,,grass,grass,grass,grass,grass,grass,house,house,house,house,house,house,house,house,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,,,walkway,walkway,,,,grass,grass,grass,grass,grass,house,house,house,house,house,house,house,house,house,house,house,house,house,house,grass,grass,grass,grass
,,,,,,,,,grass,grass,grass,grass,grass,grass,,,,grass,grass,grass,house,house,house,house,house,house,house,house,house,house,house,house,house,house,grass,grass,grass,
,,,,,,,,grass,grass,grass,grass,grass,grass,grass,grass,,,,grass,grass,house,house,house,house,house,house,house,house,house,house,house,house,house,house,grass,grass,,
,,,,,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,,,
,,,,,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,,,,,,,,,,walkway,walkway,,,,,,,,,,,
walkway,walkway,walkway,walkway,walkway,walkway,walkway,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway
walkway,walkway,walkway,walkway,walkway,walkway,walkway,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway,walkway
,,,,,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,grass,grass,grass,grass,grass,grass,grass,grass,grass,grass,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,grass,grass,grass,grass,grass,grass,grass,grass,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,grass,grass,grass,grass,grass,grass,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,
,,,,,,,,,,,walkway,walkway,,,,,,,,,,,,,,,,,,,,,,,,,,`;

const cells = csv
  .split(/[\r\n]+/)
  //.reverse()
  .map(
    (line, row) =>
      line
        .split(",")
        //.reverse()
        .map((cell, column) => ({ cell, row, column }))
    //.reverse()
  );
//.reverse();

function getAtPosition(row, column) {
  const foundRow = cells[row];

  if (!foundRow) {
    return undefined;
  }

  const foundColumn = foundRow[column];

  if (!foundColumn) {
    return undefined;
  }

  return foundColumn.cell;
}

function is(cell, types) {
  return types.indexOf(cell) >= 0 ? 1 : 0;
}

cells.forEach(row =>
  row.forEach(({ cell, row, column }) => {
    switch (cell) {
      case "":
        break;
      case "walkway":
        {
          const tile = Math.random() >= 0.2 ? "walkway_1" : "walkway_2";
          const rotation = Math.floor(Math.random() * 4);
          setAtPosition(column, 0, row, rotation, tile);

          function doPathEdge(row, column) {
            const maybeAir = getAtPosition(row, column);
            if (maybeAir !== "") {
              return;
            }

            const pathAbove = is(getAtPosition(row - 1, column), ["walkway"]);
            const pathRight = is(getAtPosition(row, column + 1), ["walkway"]);
            const pathBelow = is(getAtPosition(row + 1, column), ["walkway"]);
            const pathLeft = is(getAtPosition(row, column - 1), ["walkway"]);
            const pathTotal = pathAbove + pathRight + pathBelow + pathLeft;

            let tileBase;
            let tileAbove;
            let rotation = 0;

            switch (pathTotal) {
              case 0:
                throw new Error("Unexpected surrounding blocks");
              case 1:
                tileBase = "walkway_base_straight";
                tileAbove = "walkway_rope_straight";
                if (pathAbove === 1) {
                  rotation = 1;
                } else if (pathRight === 1) {
                  rotation = 0;
                } else if (pathBelow === 1) {
                  rotation = 3;
                } else if (pathLeft === 1) {
                  rotation = 2;
                }
                break;
              case 2:
                tileBase = "walkway_base_in";
                tileAbove = "walkway_rope_in";
                if (pathAbove === 0 && pathRight === 0) {
                  rotation = 2;
                } else if (pathRight === 0 && pathBelow === 0) {
                  rotation = 1;
                } else if (pathBelow === 0 && pathLeft === 0) {
                  rotation = 0;
                } else if (pathLeft === 0 && pathAbove === 0) {
                  rotation = 3;
                }
                break;
              case 3:
                throw new Error("Unexpected surrounding blocks");
              case 4:
                throw new Error("Unexpected surrounding blocks");
            }

            setAtPosition(column, 0, row, rotation, tileBase);
            setAtPosition(column, 1, row, rotation, tileAbove);
          }

          doPathEdge(row - 1, column);
          doPathEdge(row, column + 1);
          doPathEdge(row + 1, column);
          doPathEdge(row, column - 1);
        }
        break;
      case "grass":
        {
          const solid = ["grass", "house"];
          const grassAbove = is(getAtPosition(row - 1, column), solid);
          const grassRight = is(getAtPosition(row, column + 1), solid);
          const grassBelow = is(getAtPosition(row + 1, column), solid);
          const grassLeft = is(getAtPosition(row, column - 1), solid);
          const grassTotal = grassAbove + grassBelow + grassLeft + grassRight;

          let isIsolated = true;
          for (let x = row - 2; x <= row + 2; x++) {
            for (let y = column - 2; y <= column + 2; y++) {
              if (is(getAtPosition(x, y), ["house", "walkway"]) === 1) {
                isIsolated = false;
              }
            }
          }

          let tile = "grass";
          let isolated = "grass";
          let rotation = 0;

          switch (grassTotal) {
            case 0:
              throw new Error("Unexpected surrounding blocks");
            case 1:
              throw new Error("Unexpected surrounding blocks");
            case 2:

              if (grassAbove === 0 && grassRight === 0) {
                rotation = 0;
              } else if (grassRight === 0 && grassBelow === 0) {
                rotation = 3;
              } else if (grassBelow === 0 && grassLeft === 0) {
                rotation = 2;
              } else if (grassLeft === 0 && grassAbove === 0) {
                rotation = 1;
              }

              if (isIsolated) {
                tile = `edge2_corner_out_${Math.floor(Math.random() * 6) + 1}`;
                setAtPosition(column, 0, row, rotation, tile);
                isolated = `fence1_out_${Math.floor(Math.random() * 4) + 1}`;
                setAtPosition(column, 1, row, rotation, isolated);
              } else {
                tile = `edge1_corner_out_${Math.floor(Math.random() * 6) + 1}`;
                setAtPosition(column, 0, row, rotation, tile);
              }

              break;
            case 3:

              if (grassAbove === 0) {
                rotation = 1;
              } else if (grassRight === 0) {
                rotation = 0;
              } else if (grassBelow === 0) {
                rotation = 3;
              } else if (grassLeft === 0) {
                rotation = 2;
              }

              if (isIsolated) {
                tile = `edge2_straight_${Math.floor(Math.random() * 4) + 1}`;
                setAtPosition(column, 0, row, rotation, tile);
                isolated = `fence1_straight_${Math.floor(Math.random() * 3) + 1}`;
                setAtPosition(column, 1, row, rotation, isolated);
              } else {
                tile = `edge1_straight_${Math.floor(Math.random() * 4) + 1}`;
                setAtPosition(column, 0, row, rotation, tile);
              }
              break;
            case 4:
              // TODO:
              tile = "edge1_corner_in_1";
              tile = "grass";

              setAtPosition(column, 0, row, rotation, tile);
              break;
          }
        }
        break;
      case "house":
        {
          const houseUp = is(getAtPosition(row - 1, column), ["house"]);
          const houseRight = is(getAtPosition(row, column + 1), ["house"]);
          const houseDown = is(getAtPosition(row + 1, column), ["house"]);
          const houseLeft = is(getAtPosition(row, column - 1), ["house"]);
          const houseTotal = houseUp + houseRight + houseDown + houseLeft;

          switch (houseTotal) {
            case 0:
              throw new Error("Unexpected surrounding blocks");
            case 1:
              throw new Error("Unexpected surrounding blocks");
            case 2:
              {
                let rotation = 0;

                if (houseUp === 0 && houseRight === 0) {
                  rotation = 1;
                } else if (houseRight === 0 && houseDown === 0) {
                  rotation = 0;
                } else if (houseDown === 0 && houseLeft === 0) {
                  rotation = 3;
                } else if (houseLeft === 0 && houseUp === 0) {
                  rotation = 2;
                }

                setAtPosition(column, 0, row, 0, "grass");
                setAtPosition(column, 1, row, rotation, "wall_out");
                setAtPosition(column, 2, row, rotation, "wall_out");
              }
              break;
            case 3:
              {
                let rotation = 0;

                if (houseUp === 0) {
                  rotation = 1;
                } else if (houseRight === 0) {
                  rotation = 0;
                } else if (houseDown === 0) {
                  rotation = 3;
                } else if (houseLeft === 0) {
                  rotation = 2;
                }

                setAtPosition(column, 0, row, 0, "grass");
                setAtPosition(column, 1, row, rotation, "wall_straight");
                setAtPosition(column, 2, row, rotation, "wall_straight");
              }
              break;
            case 4:
              {
                const houseUpRight = is(getAtPosition(row - 1, column + 1), [
                  "house"
                ]);
                const houseDownRight = is(getAtPosition(row + 1, column + 1), [
                  "house"
                ]);
                const houseDownLeft = is(getAtPosition(row + 1, column - 1), [
                  "house"
                ]);
                const houseUpLeft = is(getAtPosition(row - 1, column - 1), [
                  "house"
                ]);
                const diagonalTotal =
                  houseUpRight + houseDownRight + houseDownLeft + houseUpLeft;

                if (diagonalTotal === 4) {
                  setAtPosition(column, 0, row, 0, "carpet_1");
                  return;
                }

                let rotation = 0;

                if (houseUpRight === 0) {
                  rotation = 1;
                } else if (houseDownRight === 0) {
                  rotation = 0;
                } else if (houseDownLeft === 0) {
                  rotation = 3;
                } else if (houseUpLeft === 0) {
                  rotation = 2;
                }

                setAtPosition(column, 0, row, 0, "grass");
                setAtPosition(column, 1, row, rotation, "wall_in");
                setAtPosition(column, 2, row, rotation, "wall_in");
              }
              break;
          }
        }
        break;
    }
  })
);

const walkableTiles = [
  "edge1_corner_out_1",
  "edge1_corner_out_2",
  "edge1_corner_out_3",
  "edge1_corner_out_4",
  "edge1_corner_out_5",
  "edge1_corner_out_6",
  "edge1_corner_in_1",
  "edge1_corner_in_2",
  "edge1_straight_1",
  "edge1_straight_2",
  "edge1_straight_3",
  "edge1_straight_4",
  "grass",
  "walkway_1",
  "walkway_2",
  "carpet_1",
  "carpet_2",
  "carpet_3",
  "carpet_4",
  "carpet_5",
  "carpet_6"
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
    x: 6,
    y: 1,
    z: 26
  },
  time_trigger: {
    frequency: "hourly",
    action: "moveToRandomLocation"
  }
});

const content = JSON.stringify(withIds, null, 2);
fs.writeFileSync("./src/world.json", content);
