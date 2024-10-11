import { initWasm } from '@resvg/resvg-wasm';
import { Hono } from 'hono';
import getValidatedOptions from './helper';
import generateImage from './image';

// Cache-related imports
import {
  base64ToUint8Array,
  generateKeyFromJSON,
  uint8ArrayToBase64,
} from './helper';

// @ts-ignore
import WASM_RESVG from '@resvg/resvg-wasm/index_bg.wasm';

await initWasm(WASM_RESVG);

type Bindings = {
  KV: KVNamespace;
  CACHE_ENABLED: string;
};

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
  return !!text.match(
    /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/,
  );
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

  // Generate cache key
  const key = await generateKeyFromJSON(options);

  let image: Uint8Array | string | null;

  if (c.env.CACHE_ENABLED === 'true') {
    if (options.format === 'svg') {
      image = await c.env.KV.get(key, 'text');
      c.header('Content-Type', 'image/svg+xml');
    } else {
      image = await c.env.KV.get(key, 'text');
      c.header('Content-Type', 'image/png');
    }

    if (image) {
      c.header('Cache-Control', 'public, max-age=86400');
      c.header('Cache', 'HIT');
      return c.body(
        options.format === 'svg'
          ? image
          : (base64ToUint8Array(image) as unknown as string),
      );
    }

    c.header('Cache', 'MISS');
  } else {
    c.header(
      'Content-Type',
      options.format === 'svg' ? 'image/svg+xml' : 'image/png',
    );
    c.header('Cache-Control', 'public, max-age=86400');
  }

  image = await generateImage(options);

  if (c.env.CACHE_ENABLED === 'true') {
    if (options.format === 'svg') {
      await c.env.KV.put(key, image as string, {
        expirationTtl: 60 * 60 * 24,
      });
    } else {
      await c.env.KV.put(key, uint8ArrayToBase64(image as Uint8Array), {
        expirationTtl: 60 * 60 * 24,
      });
    }
  } else {
    c.header('Cahe', 'DISABLED');
  }

  return c.body(image as string);
});

export default app;
