import { Sprite } from "./sprite";
import * as fs from "fs";
import { PNG } from "pngjs";

const partsPerPixel = 4;

export function loadSprite(name: string): Promise<Sprite> {
  const path = `./models/slices/${name}.png`;
  return new Promise<Sprite>((resolve, reject) => {
    fs.createReadStream(path)
      .pipe(
        new PNG({
          filterType: 4
        })
      )
      .on("parsed", function(this: PNG) {
        let size = this.width;

        if (this.height != size * size) {
          reject(new Error(`${path} is not a cube`));
        }

        let data = new Uint8ClampedArray(partsPerPixel * size * size * size);

        for (let x = 0; x < size; x++) {
          for (let z = 0; z < size; z++) {
            for (let y = 0; y < size; y++) {
              const pixelIndex = x + z * size + y * size * size;
              const imageDataIndex = pixelIndex * partsPerPixel;

              data[imageDataIndex + 0] = this.data[imageDataIndex + 0];
              data[imageDataIndex + 1] = this.data[imageDataIndex + 1];
              data[imageDataIndex + 2] = this.data[imageDataIndex + 2];
              data[imageDataIndex + 3] = this.data[imageDataIndex + 3];
            }
          }
        }

        resolve({ data, size });
      });
  });
}
