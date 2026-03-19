import { httpRouter } from "convex/server";

import { authComponent, createAuth } from "./auth";
import { chat, chatOptions } from "./chat";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/api/chat",
  method: "POST",
  handler: chat,
});

http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: chatOptions,
});

export default http;
