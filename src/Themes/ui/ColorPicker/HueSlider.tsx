import React, { useEffect } from "react";

type Props = {
  hue: number;
  setHue: (hue: number) => void;
};

const SLIDER_CLASS = "color_picker_hue_slider";

const GRADIENT_BACKGROUND = `\
rgba(0, 0, 0, 0) 
linear-gradient(to right, 
  rgb(255, 0, 0) 0%, 
  rgb(255, 255, 0) 17%, 
  rgb(0, 255, 0) 33%, 
  rgb(0, 255, 255) 50%, 
  rgb(0, 0, 255) 67%, 
  rgb(255, 0, 255) 83%, 
  rgb(255, 0, 0) 100%
) 
repeat scroll 0% 0%`;

const THUMB_SELECTORS = [`.${SLIDER_CLASS}::-moz-range-thumb`, `.${SLIDER_CLASS}::-webkit-slider-thumb`];

const THUMB_RULES = THUMB_SELECTORS.map(
  (s) => /*css*/ `
${s} {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: white;
  width: 17px;
  height: 17px;
  border-radius: 100%;
  cursor: pointer;
}
`,
).join("");

const THUMB_HOVER_RULES = THUMB_SELECTORS.map(
  (s) => /*css*/ `
${s}:hover {
  background: lightgrey;
}
`,
).join("");

const CSS = /*css*/ `
${THUMB_RULES}
${THUMB_HOVER_RULES}
`;
const styleSheet = new CSSStyleSheet();
styleSheet.replace(CSS);

export function HueSlider({ hue, setHue }: Props) {
  useEffect(() => {
    if (document.adoptedStyleSheets.includes(styleSheet)) return;
    document.adoptedStyleSheets.push(styleSheet);
    return () => void (document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s != styleSheet));
  }, []);

  return (
    <input
      className={SLIDER_CLASS}
      style={{
        height: "15px",
        background: GRADIENT_BACKGROUND,
        appearance: "none",
        MozAppearance: "none",
        WebkitAppearance: "none",
      }}
      value={hue + ""}
      type="range"
      min={0}
      max={360}
      step={1}
      onChange={(e) => setHue(+e.currentTarget.value)}
    ></input>
  );
}
