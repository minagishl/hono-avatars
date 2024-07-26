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

app.get('/', (c) => {
  // Get & set parameter values
  let { name, background } = c.req.query();
  name = emojiDeletion(name) || 'World';
  background = background || '#000';

  return c.text(`Hello, ${name}!`);
});

export default app;
