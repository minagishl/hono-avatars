import { Options, DEFAULTS } from '.';

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
  } else {
    const truncatedName = name.slice(0, length);
    return uppercase ? truncatedName.toUpperCase() : truncatedName;
  }
}

// Helper function to validate and parse query parameters
export default function getValidatedOptions(c: any): Options {
  // Parse query parameters
  const query = c.req.query();

  const background = query.background || DEFAULTS.BACKGROUND;
  const blur = parseFloat(query.blur) || DEFAULTS.BLUR;
  const bold = query.bold === 'true';

  // Border options
  const border = query.border || null;
  const borderStyle = query['border-style'] || 'solid';
  const borderWidth =
    parseFloat(query['border-width']) || DEFAULTS.BORDER_WIDTH;

  // Font options
  const color = query.color || DEFAULTS.COLOR;
  const fontSize = parseFloat(query['font-size']) || DEFAULTS.FONT_SIZE;
  const fontFamily = query['font-family'] || DEFAULTS.FONT_FAMILY;

  const format = query.format || DEFAULTS.FORMAT;
  const length = query['length'] || DEFAULTS.LENGTH;
  const name = query.name || DEFAULTS.NAME;
  const oblique = query.oblique === 'true';
  const opacity = parseFloat(query.opacity) || 1;
  const reverse = query.reverse === 'true';
  const rotate = parseFloat(query.rotate) || 0;
  const rounded = query.rounded === 'true';
  const shadow = query.shadow === 'true'; // Text shadow
  const size = parseFloat(query.size) || DEFAULTS.SIZE;
  const uppercase = query.uppercase !== 'false';

  const spaceDeleteName = removeEmojis(name.replace(/ /g, '+'));
  const newBackground = isHex(background)
    ? `#${background}`
    : `#${DEFAULTS.BACKGROUND}`;
  let newLength =
    length === 'full' ? spaceDeleteName.length : parseFloat(length);
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
