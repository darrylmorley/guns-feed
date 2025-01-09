import { serve } from "@hono/node-server";
import { Hono } from "hono";
import prisma from "./lib/db.js";
import { logger } from "hono/logger";

const app = new Hono();

const accessToken = process.env.ACCESS_TOKEN;

const customPrintFunc = (info: any) => {
  console.log(info);
};

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

app.use(logger(customPrintFunc));

app.get("/", async (c) => {
  const ip = c.req.header("X-Real-IP") || c.req.header("X-Forwarded-For");
  customPrintFunc(`Connection from: ${ip}`);

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
