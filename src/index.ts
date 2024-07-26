import { Hono } from 'hono';

type Bindings = {
  [key in keyof CloudflareBindings]: CloudflareBindings[key];
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', (c) => {
  // Get & set parameter values
  let { name, background } = c.req.query();
  background = background || '#000';

  return c.text(`Hello, ${name}!`);
});

export default app;
