import assert from "node:assert/strict";
import test from "node:test";

const colors = {
  pitch950: "#06110D",
  pitch850: "#10251B",
  electric500: "#22E36D",
  lime300: "#C9F45B",
  chalk50: "#F4F8F5",
  steel400: "#8CA398",
};

function luminance(hex) {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("las combinaciones principales cumplen WCAG AA para texto normal", () => {
  assert.ok(contrast(colors.chalk50, colors.pitch950) >= 4.5);
  assert.ok(contrast(colors.steel400, colors.pitch950) >= 4.5);
  assert.ok(contrast(colors.electric500, colors.pitch950) >= 4.5);
  assert.ok(contrast(colors.pitch950, colors.electric500) >= 4.5);
  assert.ok(contrast(colors.pitch950, colors.lime300) >= 4.5);
});
