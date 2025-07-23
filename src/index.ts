import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { initWasm } from '@resvg/resvg-wasm';
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

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// OpenAPI schema definitions
const QuerySchema = z.object({
  name: z.string().max(40).optional().default('John+Doe').openapi({
    example: 'John+Doe',
    description:
      'Name to display in the avatar. Use + to separate first and last name',
  }),
  size: z.coerce.number().min(16).max(512).optional().default(64).openapi({
    example: 64,
    description: 'Size of the avatar in pixels',
  }),
  background: z.string().optional().default('DDDDDD').openapi({
    example: 'DDDDDD',
    description: 'Background color in hex format (without #)',
  }),
  color: z.string().optional().default('222222').openapi({
    example: '222222',
    description: 'Text color in hex format (without #)',
  }),
  'font-size': z.coerce
    .number()
    .min(0.1)
    .max(1)
    .optional()
    .default(0.5)
    .openapi({
      example: 0.5,
      description: 'Font size as a ratio (0.1 to 1.0)',
    }),
  'font-family': z.enum(['sans', 'mono']).optional().default('sans').openapi({
    example: 'sans',
    description: 'Font family to use',
  }),
  bold: z.enum(['true', 'false']).optional().default('false').openapi({
    example: 'false',
    description: 'Whether to use bold font',
  }),
  length: z
    .union([z.coerce.number(), z.literal('full')])
    .optional()
    .default(2)
    .openapi({
      example: 2,
      description:
        'Number of characters to display or "full" for all characters',
    }),
  format: z.enum(['png', 'svg']).optional().default('png').openapi({
    example: 'png',
    description: 'Output format',
  }),
  rounded: z.enum(['true', 'false']).optional().default('false').openapi({
    example: 'false',
    description: 'Whether to make the avatar rounded',
  }),
  uppercase: z.enum(['true', 'false']).optional().default('true').openapi({
    example: 'true',
    description: 'Whether to convert text to uppercase',
  }),
  reverse: z.enum(['true', 'false']).optional().default('false').openapi({
    example: 'false',
    description: 'Whether to reverse the name order',
  }),
  rotate: z.coerce.number().min(-360).max(360).optional().default(0).openapi({
    example: 0,
    description: 'Rotation angle in degrees',
  }),
  blur: z.coerce.number().min(0).max(1).optional().default(0).openapi({
    example: 0,
    description: 'Blur amount (0 to 1)',
  }),
  opacity: z.coerce.number().min(0).max(1).optional().default(1).openapi({
    example: 1,
    description: 'Opacity (0 to 1)',
  }),
  oblique: z.enum(['true', 'false']).optional().default('false').openapi({
    example: 'false',
    description: 'Whether to use oblique/italic font',
  }),
  shadow: z.enum(['true', 'false']).optional().default('false').openapi({
    example: 'false',
    description: 'Whether to add text shadow',
  }),
  border: z.string().optional().openapi({
    example: '000000',
    description: 'Border color in hex format (without #)',
  }),
  'border-width': z.coerce
    .number()
    .min(0.1)
    .max(1)
    .optional()
    .default(0.5)
    .openapi({
      example: 0.5,
      description: 'Border width as a ratio (0.1 to 1.0)',
    }),
  'border-style': z
    .enum(['solid', 'dashed', 'dotted'])
    .optional()
    .default('solid')
    .openapi({
      example: 'solid',
      description: 'Border style',
    }),
  preset: z.enum(['default', 'google']).optional().default('default').openapi({
    example: 'default',
    description: 'Preset style configuration',
  }),
});

const ErrorResponseSchema = z.object({
  error: z.string().openapi({
    example: 'Name is too long',
    description: 'Error message',
  }),
});

// Helper function to check if text includes Japanese characters
function includeJA(text: string): boolean {
  return !!text.match(
    /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/,
  );
}

// Define the avatar generation route
const avatarRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: QuerySchema,
  },
  responses: {
    200: {
      description: 'Generated avatar image',
      content: {
        'image/png': {
          schema: z.string().openapi({
            format: 'binary',
            description: 'PNG image binary data',
          }),
        },
        'image/svg+xml': {
          schema: z.string().openapi({
            description: 'SVG image as text',
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
  tags: ['Avatar Generation'],
});

app.openapi(avatarRoute, async (c) => {
  const options = getValidatedOptions(c);

  if (options.fontFamily === 'mono' && includeJA(options.name)) {
    return c.json(
      { error: 'Japanese characters are not supported with mono' },
      400,
    );
  }

  if (options.name.length > DEFAULTS.NAME_LENGTH) {
    return c.json({ error: 'Name is too long' }, 400);
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

// Add OpenAPI documentation endpoint
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Hono Avatars API',
    version: '1.0.0',
    description: 'Generate custom avatar images with various styling options',
  },
});

// Add Swagger UI endpoint
app.get('/docs', swaggerUI({ url: '/openapi.json' }));

export default app;
