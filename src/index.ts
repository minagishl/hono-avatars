import { Hono } from 'hono';
import generateImage from './image';
import { initWasm } from '@resvg/resvg-wasm';
// @ts-ignore
import WASM_RESVG from './../node_modules/@resvg/resvg-wasm/index_bg.wasm';

await initWasm(WASM_RESVG);

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
};

const app = new Hono<{ Bindings: Bindings }>();

// Function to check if a string is a valid hex string
function isHex(text: string): boolean {
  // A hex string should match the pattern: ^[0-9A-Fa-f]+$
  const hexRegex = /^[0-9A-Fa-f]+$/;
  return hexRegex.test(text);
}

// Function to delete emojis from text
function emojiDeletion(text: string): string {
  const regex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return text.replace(regex, '');
}

// Function to transform name based on specified rules
function transformName(
  name: string,
  length: number,
  uppercase: boolean,
): string {
  if (name.includes('+')) {
    const parts = name.split('+');
    // The design is broken, so force 1
    const newLength = 1;
    let combinedName =
      parts.length > 2
        ? parts[0].slice(0, newLength) + parts[1].slice(0, newLength)
        : parts.map((part) => part.slice(0, newLength)).join('');
    return uppercase ? combinedName.toUpperCase() : combinedName;
  } else {
    return uppercase
      ? name.slice(0, length).toUpperCase()
      : name.slice(0, length);
  }
}

app.get('/', async (c) => {
  // Get & set parameter values
  const options: Options = {
    name: c.req.query('name') || 'World',
    background: c.req.query('background') || 'DDDDDD',
    color: c.req.query('color') || '222222',
    size: Number(c.req.query('size')) || 64,
    length: Number(c.req.query('length')) || 2,
    rounded: c.req.query('rounded') === 'true',
    bold: c.req.query('bold') === 'true',
    uppercase: c.req.query('uppercase')
      ? c.req.query('uppercase') === 'true'
      : true,
    format: c.req.query('format') || 'png',
    fontSize: Number(c.req.query('font-size')) || 0.5,
  };

  // Initial value if blank
  options.size = Math.max(16, Math.min(512, options.size));
  options.length = Math.round(options.length);
  options.fontSize = Math.max(0.1, Math.min(1, options.fontSize));

  // Check if name is empty
  options.name = emojiDeletion(options.name.replace(/ /g, '+'));
  options.name = transformName(options.name, options.length, options.uppercase);

  // Check if background is a valid hex
  options.background = isHex(options.background)
    ? options.background
    : 'DDDDDD';
  options.background = `#${options.background}`;

  // Check if color is a valid hex
  options.color = isHex(options.color) ? options.color : '222222';
  options.color = `#${options.color}`;

  c.header(
    'Content-Type',
    options.format === 'svg' ? 'image/svg+xml' : 'image/png',
  );
  return c.body(await generateImage(options));
});

export default app;
