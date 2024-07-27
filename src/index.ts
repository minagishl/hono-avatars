import { Hono } from 'hono';
import generateImage from './image';
import { initWasm } from '@resvg/resvg-wasm';
// @ts-ignore
import WASM_RESVG from '@resvg/resvg-wasm/index_bg.wasm';

await initWasm(WASM_RESVG);

// Define constants for default values
const DEFAULTS = {
  NAME: 'John+Doe',
  BACKGROUND: 'DDDDDD',
  COLOR: '222222',
  SIZE: 64,
  LENGTH: 2,
  FORMAT: 'png',
  FONT_SIZE: 0.5,
  FONT_FAMILY: 'sans',
  NAME_LENGTH: 40,
  MIN_SIZE: 16,
  MAX_SIZE: 512,
  MIN_FONT_SIZE: 0.1,
  MAX_FONT_SIZE: 1,
};

type Bindings = {};

export type Options = {
  name: string;
  background: string;
  color: string;
  size: number;
  length: number;
  rounded: boolean;
  bold: boolean;
  uppercase: boolean;
  format: string;
  fontSize: number;
  fontFamily: string;
  shadow: boolean;
  border: string | null;
  borderStyle: string;
  opacity: number;
  reverse: boolean;
  oblique: boolean;
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
  const name = c.req.query('name') || DEFAULTS.NAME;
  const background = c.req.query('background') || DEFAULTS.BACKGROUND;
  const color = c.req.query('color') || DEFAULTS.COLOR;
  const size = Number(c.req.query('size')) || DEFAULTS.SIZE;
  const length =
    c.req.query('length') === 'full'
      ? name.length
      : Number(c.req.query('length')) || DEFAULTS.LENGTH;
  const rounded = c.req.query('rounded') === 'true';
  const bold = c.req.query('bold') === 'true';
  const uppercase = c.req.query('uppercase') !== 'false';
  const format = c.req.query('format') || DEFAULTS.FORMAT;
  const fontSize = Number(c.req.query('font-size')) || DEFAULTS.FONT_SIZE;
  const fontFamily = c.req.query('font-family') || DEFAULTS.FONT_FAMILY;
  const shadow = c.req.query('shadow') === 'true';
  const border = c.req.query('border') || null;
  const borderStyle = c.req.query('border-style') || 'solid';
  const opacity = Number(c.req.query('opacity')) || 1;
  const reverse = c.req.query('reverse') === 'true';
  const oblique = c.req.query('oblique') === 'true';

  const spaceDeleteName = removeEmojis(name.replace(/ /g, '+'));
  const newBackground = isHex(background)
    ? `#${background}`
    : `#${DEFAULTS.BACKGROUND}`;
  const newFontSize = Math.max(
    DEFAULTS.MIN_FONT_SIZE,
    Math.min(DEFAULTS.MAX_FONT_SIZE, fontSize),
  );

  return {
    name: transformName(spaceDeleteName, length, uppercase, reverse),
    background: newBackground,
    color: isHex(color) ? `#${color}` : `#${DEFAULTS.COLOR}`,
    size: Math.max(DEFAULTS.MIN_SIZE, Math.min(DEFAULTS.MAX_SIZE, size)),
    length: Math.round(length),
    rounded,
    bold,
    uppercase,
    format,
    fontSize: newFontSize,
    fontFamily,
    shadow,
    border: border && isHex(border) ? `#${border}` : null,
    borderStyle,
    opacity,
    reverse,
    oblique,
  };
};

app.get('/', async (c) => {
  const options = getValidatedOptions(c);

  console.log(options);

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
