import { Hono } from 'hono';
import generateImage from './image';
import { initWasm } from '@resvg/resvg-wasm';
// @ts-ignore
import WASM_RESVG from '@resvg/resvg-wasm/index_bg.wasm';

await initWasm(WASM_RESVG);

// Define constants for default values
const DEFAULTS = {
  BACKGROUND: 'DDDDDD',
  BLUR: 0,
  BOLD: false,
  BORDER_WIDTH: 0.5,
  COLOR: '222222',
  FONT_FAMILY: 'sans',
  FONT_SIZE: 0.5,
  FORMAT: 'png',
  LENGTH: 2,
  MAX_BLUR: 1,
  MAX_BORDER_WIDTH: 1,
  MAX_FONT_SIZE: 1,
  MAX_ROTATE: 360,
  MAX_SIZE: 512,
  MIN_BLUR: 0,
  MIN_BORDER_WIDTH: 0.1,
  MIN_FONT_SIZE: 0.1,
  MIN_ROTATE: -360,
  MIN_SIZE: 16,
  NAME: 'John+Doe',
  NAME_LENGTH: 40,
  ROTATE: 0,
  SIZE: 64,
};

type Bindings = {};

export type Options = {
  background: string;
  blur: number;
  bold: boolean;
  border: string | null;
  borderStyle: string;
  borderWidth: number;
  color: string;
  fontFamily: string;
  fontSize: number;
  format: string;
  length: number;
  name: string;
  oblique: boolean;
  opacity: number;
  reverse: boolean;
  rotate: number;
  rounded: boolean;
  shadow: boolean;
  size: number;
  uppercase: boolean;
};

const app = new Hono<{ Bindings: Bindings }>();

// Helper function to check if a string is a valid hex string
function isHex(text: string): boolean {
  const hexRegex = /^[0-9A-Fa-f]+$/;
  return hexRegex.test(text);
}

// Helper function to remove emojis from text
function removeEmojis(text: string): string {
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return text.replace(emojiRegex, '');
}

// Helper function to check if text includes Japanese characters
function includeJA(text: string): boolean {
  return text.match(/^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/)
    ? true
    : false;
}

// Helper function to transform the name based on specified rules
function transformName(
  name: string,
  length: number,
  uppercase: boolean,
  reverse: boolean,
): string {
  if (name.includes('+')) {
    const parts = name.split('+');
    const newLength = length === 1 ? 0 : length - 1;
    const combinedName =
      parts[reverse ? 1 : 0].slice(0, reverse ? newLength : 1) +
      parts[reverse ? 0 : 1].slice(0, reverse ? 1 : newLength);
    return uppercase ? combinedName.toUpperCase() : combinedName;
  } else {
    return uppercase
      ? name.slice(0, length).toUpperCase()
      : name.slice(0, length);
  }
}

// Helper function to validate and parse query parameters
const getValidatedOptions = (c: any): Options => {
  // Parse query parameters
  const query = c.req.query();

  const background = query.background || DEFAULTS.BACKGROUND;
  const blur = Number(query.blur) || DEFAULTS.BLUR;
  const bold = query.bold === 'true';

  // Border options
  const border = query.border || null;
  const borderStyle = query['border-style'] || 'solid';
  const borderWidth = Number(query['border-width']) || DEFAULTS.BORDER_WIDTH;

  // Font options
  const color = query.color || DEFAULTS.COLOR;
  const fontSize = Number(query['font-size']) || DEFAULTS.FONT_SIZE;
  const fontFamily = query['font-family'] || DEFAULTS.FONT_FAMILY;

  const format = query.format || DEFAULTS.FORMAT;
  const length = query.length || DEFAULTS.LENGTH;
  const name = query.name || DEFAULTS.NAME;
  const oblique = query.oblique === 'true';
  const opacity = Number(query.opacity) || 1;
  const reverse = query.reverse === 'true';
  const rotate = Number(query.rotate) || 0;
  const rounded = query.rounded === 'true';
  const shadow = query.shadow === 'true'; // Text shadow
  const size = Number(query.size) || DEFAULTS.SIZE;
  const uppercase = query.uppercase !== 'false';

  const spaceDeleteName = removeEmojis(name.replace(/ /g, '+'));
  const newBackground = isHex(background)
    ? `#${background}`
    : `#${DEFAULTS.BACKGROUND}`;
  const newLength = length === 'full' ? spaceDeleteName.length : Number(length);
  const newFontSize = Math.max(
    DEFAULTS.MIN_FONT_SIZE,
    Math.min(DEFAULTS.MAX_FONT_SIZE, fontSize),
  );
  const newBorderWidth = Math.max(
    DEFAULTS.MIN_BORDER_WIDTH,
    Math.min(DEFAULTS.MAX_BORDER_WIDTH, borderWidth),
  );
  const newRotate = Math.max(
    DEFAULTS.MIN_ROTATE,
    Math.min(DEFAULTS.MAX_ROTATE, rotate),
  );

  return {
    background: newBackground,
    blur: Math.max(DEFAULTS.MIN_BLUR, Math.min(DEFAULTS.MAX_BLUR, blur)),
    bold,
    border: border && isHex(border) ? `#${border}` : null,
    borderStyle,
    borderWidth: newBorderWidth,
    color: isHex(color) ? `#${color}` : `#${DEFAULTS.COLOR}`,
    fontFamily,
    fontSize: newFontSize,
    format,
    length: Math.round(newLength),
    name: transformName(spaceDeleteName, length, uppercase, reverse),
    oblique,
    opacity,
    reverse,
    rotate: newRotate,
    rounded,
    shadow,
    size: Math.max(DEFAULTS.MIN_SIZE, Math.min(DEFAULTS.MAX_SIZE, size)),
    uppercase,
  };
};

app.get('/', async (c) => {
  const options = getValidatedOptions(c);

  if (options.fontFamily === 'mono' && includeJA(options.name)) {
    c.status(400);
    return c.json({ error: 'Japanese characters are not supported with mono' });
  }

  if (options.name.length > DEFAULTS.NAME_LENGTH) {
    c.status(400);
    return c.json({ error: 'Name is too long' });
  }

  c.header(
    'Content-Type',
    options.format === 'svg' ? 'image/svg+xml' : 'image/png',
  );
  return c.body(await generateImage(options));
});

export default app;
