import { Hono } from 'hono';

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
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
function transformName(name: string, uppercase: boolean): string {
  if (name.includes('+')) {
    const parts = name.split('+');
    let combinedName =
      parts.length > 2
        ? parts[0][0] + parts[1][0]
        : parts.map((part) => part[0]).join('');
    return uppercase ? combinedName.toUpperCase() : combinedName;
  } else {
    return uppercase ? name.slice(0, 2).toUpperCase() : name.slice(0, 2);
  }
}

app.get('/', (c) => {
  // Get & set parameter values
  let {
    name,
    background,
    color,
    size,
    length,
    rounded,
    bold,
    uppercase,
    format,
  } = c.req.query();
  const fontSize = c.req.query('font-size');
  const isRounded = rounded === 'true';
  const isBold = bold === 'true';
  const isUppercase = uppercase === 'true';
  const isSvg = format === 'svg';

  // Check if name is empty
  name = emojiDeletion(name.replace(/ /g, '+')) || 'World';
  name = transformName(name, isUppercase);

  // Check if background is a valid
  background = isHex(background) ? background : 'DDDDDD';
  background = `#${background}`;

  // Check if color is a valid
  color = isHex(color) ? color : '222222';
  color = `#${color}`;

  // Initial value if blank
  size = size ?? '64';
  length = String(Math.round(Number(length) || 1));

  return c.text(`Hello, ${name}!`);
});

export default app;
