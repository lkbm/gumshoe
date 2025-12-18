import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";

export interface Env {
	gumshoe: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// API routes
app.get("/api/state/:key", async (c) => {
	const key = c.req.param("key");
	const value = await c.env.gumshoe.get(key);
	return c.json({ value });
});

app.put("/api/state/:key", async (c) => {
	const key = c.req.param("key");
	const { value } = await c.req.json();
	await c.env.gumshoe.put(key, value);
	return c.json({ success: true });
});

// Serve static assets
app.get("*", serveStatic({
	root: "./dist",
	rewriteRequestPath: (path) => {
		if (path === "/") return "/index.html";
		return path;
	},
	manifest: {} // Added required manifest property
}));

export default app;
