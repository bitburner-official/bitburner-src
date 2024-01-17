export type RgbTuple = [number, number, number];
export type HslTuple = [number, number, number];

/**
 * Converts a hex color code into a tuple of numbers.
 *
 * @example
 *   hexStringToRgb('#FFFFFF'); // returns [255, 255, 255]
 *   hexStringToRgb('#000000'); // returns [0, 0, 0]
 *   hexStringToRgb('#102030'); // returns [16, 32, 48]
 *
 * @param hex - The input hexadecimal color code string.
 * @returns A triplet of decimal numbers in the [0-255] range.
 */
export function hexStringToRgb(hex: string): RgbTuple {
  const whole_color = parseInt(hex.replace("#", ""), 16);
  const red = (whole_color >> 16) & 255;
  const green = (whole_color >> 8) & 255;
  const blue = whole_color & 255;

  const rgb_tuple: RgbTuple = [red, green, blue];
  return rgb_tuple;
}

/**
 * Converts an rgb triplet into an hsl triplet.
 *
 * @example
 *   rgbToHsl([255, 255, 255]); // returns [0, 0, 100]
 *   rgbToHsl([0, 0, 0]);       // returns [0, 0, 0]
 *   rgbToHsl([16, 32, 48]);    // returns [210, 50, 13]
 *
 * @param rgb - The input color as an rgb tuple.
 * @returns A tuple of decimal numbers in the [0-360],
 *          [0-100], and [0-100] ranges.
 */
export function rgbToHsl(rgb: RgbTuple) {
  const red = rgb[0] / 255;
  const green = rgb[1] / 255;
  const blue = rgb[2] / 255;

  const color_max = Math.max(red, green, blue);
  const color_min = Math.min(red, green, blue);

  const delta = color_max - color_min;

  let hue: number = 0;
  let saturation: number = 0;
  const lightness = (color_max + color_min) / 2;
  if (!delta) {
    hue = 0;
    saturation = 0;
  } else {
    switch (color_max) {
      case red:
        hue = (((green - blue) / delta) % 6) / 6;
        break;
      case green:
        hue = ((blue - red) / delta + 2) / 6;
        break;
      case blue:
        hue = ((red - green) / delta + 4) / 6;
        break;
    }

    saturation = delta / (1 - Math.abs(2 * lightness - 1));
  }

  const hsl_tuple: HslTuple = [Math.round(hue * 360), Math.round(saturation * 100), Math.round(lightness * 100)];
  return hsl_tuple;
}
