import { Hono } from 'hono';
import generateImage from './image';
import getValidatedOptions from './helper';
import { initWasm } from '@resvg/resvg-wasm';
// @ts-ignore
import WASM_RESVG from '@resvg/resvg-wasm/index_bg.wasm';

await initWasm(WASM_RESVG);

type Bindings = {};

// Define constants for default values
export const DEFAULTS = {
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

// Helper function to check if text includes Japanese characters
function includeJA(text: string): boolean {
  return text.match(/^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/)
    ? true
    : false;
}

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
