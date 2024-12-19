import { serve } from "@hono/node-server";
import { Hono } from "hono";
import prisma from "./lib/db.js";

const app = new Hono();

const accessToken = process.env.ACCESS_TOKEN;

// Middleware to restrict access by access token
app.use("*", async (c, next) => {
  const token =
    c.req.header("Authorization")?.replace("Bearer ", "") ||
    c.req.query("access_token");

  if (token === accessToken) {
    return next();
  }

  return c.text("Unauthorized access", 401);
});

app.get("/", async (c) => {
  try {
    const items = await prisma.gun.findMany({
      include: {
        Image: true,
      },
    });

    const sanitizedItems = items.map((item) => ({
      ...item,
      Image: item.Image.map((image) => ({
        url: image.original_url,
      })),
    }));

    return c.json(sanitizedItems);
  } catch (error) {
    console.error(error);
    return c.text("An error occurred", 500);
  }
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
