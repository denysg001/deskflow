import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import staticFiles from "@fastify/static";
import Fastify from "fastify";
import { mkdirSync } from "fs";
import { resolve } from "path";
import { env } from "./config/env.js";
import { adminRoutes } from "./modules/admin/routes.js";
import { authRoutes } from "./modules/auth/routes.js";
import { catalogRoutes } from "./modules/catalog/routes.js";
import { reportRoutes } from "./modules/reports/routes.js";
import { ticketRoutes } from "./modules/tickets/routes.js";
import { prisma } from "./plugins/prisma.js";

const app = Fastify({ logger: true });
mkdirSync("uploads", { recursive: true });

app.register(cors, { origin: true, credentials: true });
app.register(multipart, { limits: { fileSize: 8 * 1024 * 1024 } });
app.register(staticFiles, { root: resolve("uploads"), prefix: "/uploads/", decorateReply: false });

app.get("/health", async () => ({ status: "ok", name: "DeskFlow API" }));
app.register(authRoutes, { prefix: "/api" });
app.register(catalogRoutes, { prefix: "/api" });
app.register(ticketRoutes, { prefix: "/api" });
app.register(adminRoutes, { prefix: "/api" });
app.register(reportRoutes, { prefix: "/api" });

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  const status = "statusCode" in error ? Number(error.statusCode) : 500;
  reply.code(status >= 400 ? status : 500).send({ message: status >= 500 ? "Erro interno do servidor." : error.message });
});

app.addHook("onClose", async () => {
  await prisma.$disconnect();
});

app.listen({ host: "0.0.0.0", port: env.PORT });
