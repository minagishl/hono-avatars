import { Hono } from 'hono';

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const app = new Hono<{ Bindings: Bindings }>();

// Function to delete emojis from text
function emojiDeletion(text: string): string {
  const regex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  return text.replace(regex, '');
}

// Function to transform name based on specified rules
function transformName(name: string): string {
  if (name.includes('+')) {
    const parts = name.split('+');
    if (parts.length > 2) {
      return parts[0][0] + parts[1][0];
    } else {
      return parts.map((part) => part[0]).join('');
    }
  } else {
    return name.slice(0, 2).toUpperCase();
  }
}

app.get('/', (c) => {
  // Get & set parameter values
  let { name, background } = c.req.query();
  name = emojiDeletion(name.replace(/ /g, '+')) || 'World';
  name = transformName(name);
  background = background || '#000';

  return c.text(`Hello, ${name}!`);
});

export default app;
