import type { Context } from 'hono';
import { DEFAULTS } from '.';
import type { Options } from '.';

// Precompiled regular expressions
const hexRegex = /^[0-9A-Fa-f]+$/;
const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

// Helper function to check if a string is a valid hex string
function isHex(text: string): boolean {
  return hexRegex.test(text);
}

// Helper function to remove emojis from text
function removeEmojis(text: string): string {
  return text.replace(emojiRegex, '');
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
  }

  const truncatedName = name.slice(0, length);
  return uppercase ? truncatedName.toUpperCase() : truncatedName;
}

// Helper function to validate and parse query parameters
export default function getValidatedOptions(c: Context): Options {
  // Parse query parameters
  const query = c.req.query();

  const background = query.background || DEFAULTS.BACKGROUND;
  const blur = Number.parseFloat(query.blur) || DEFAULTS.BLUR;
  const bold = query.bold === 'true';

  // Border options
  const border = query.border || null;
  const borderStyle = query['border-style'] || 'solid';
  const borderWidth =
    Number.parseFloat(query['border-width']) || DEFAULTS.BORDER_WIDTH;

  // Font options
  const color = query.color || DEFAULTS.COLOR;
  const fontSize = Number.parseFloat(query['font-size']) || DEFAULTS.FONT_SIZE;
  const fontFamily = query['font-family'] || DEFAULTS.FONT_FAMILY;

  const format = query.format || DEFAULTS.FORMAT;
  const length = query.length || DEFAULTS.LENGTH;
  const name = query.name || DEFAULTS.NAME;
  const oblique = query.oblique === 'true';
  const opacity = Number.parseFloat(query.opacity) || 1;
  const reverse = query.reverse === 'true';
  const rotate = Number.parseFloat(query.rotate) || 0;
  const rounded = query.rounded === 'true';
  const shadow = query.shadow === 'true'; // Text shadow
  const size = Number.parseFloat(query.size) || DEFAULTS.SIZE;
  const uppercase = query.uppercase !== 'false';

  const spaceDeleteName = removeEmojis(name.replace(/ /g, '+'));
  const newBackground = isHex(background)
    ? `#${background}`
    : `#${DEFAULTS.BACKGROUND}`;
  let newLength =
    length === 'full'
      ? spaceDeleteName.length
      : Number.parseFloat(length.toString());
  newLength = Math.round(newLength);

  // Validate and parse query parameters
  const validatedFontSize = Math.max(
    DEFAULTS.MIN_FONT_SIZE,
    Math.min(DEFAULTS.MAX_FONT_SIZE, fontSize),
  );
  const validatedBorderWidth = Math.max(
    DEFAULTS.MIN_BORDER_WIDTH,
    Math.min(DEFAULTS.MAX_BORDER_WIDTH, borderWidth),
  );
  const validatedRotation = Math.max(
    DEFAULTS.MIN_ROTATE,
    Math.min(DEFAULTS.MAX_ROTATE, rotate),
  );

  return {
    background: newBackground,
    blur: Math.max(DEFAULTS.MIN_BLUR, Math.min(DEFAULTS.MAX_BLUR, blur)),
    bold,
    border: border && isHex(border) ? `#${border}` : null,
    borderStyle,
    borderWidth: validatedBorderWidth,
    color: isHex(color) ? `#${color}` : `#${DEFAULTS.COLOR}`,
    fontFamily,
    fontSize: validatedFontSize,
    format,
    length: newLength,
    name: transformName(spaceDeleteName, newLength, uppercase, reverse),
    oblique,
    opacity,
    reverse,
    rotate: validatedRotation,
    rounded,
    shadow,
    size: Math.max(DEFAULTS.MIN_SIZE, Math.min(DEFAULTS.MAX_SIZE, size)),
    uppercase,
  };
}

// helper function to generate a key from a JSON object
export async function generateKeyFromJSON(
  json: Record<string, unknown>,
): Promise<string> {
  // Convert to JSON string
  const jsonString = JSON.stringify(json);

  // Use a text encoder to encode the string
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  // Generate a SHA-256 hash using the Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert the hash value to a Base64 string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return hashBase64;
}

export function uint8ArrayToBase64(uint8Array: Uint8Array) {
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

export function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const uint8Array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    uint8Array[i] = binary.charCodeAt(i);
  }
  return uint8Array;
}
