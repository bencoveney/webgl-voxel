import { Sprite } from "./sprite";

export function loadSprite(name: string): Promise<Sprite> {
  const path = `./src/models/${name}.png`
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