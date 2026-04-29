import bcrypt from "bcryptjs";
import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../plugins/prisma.js";
import { authenticate, signToken } from "../../utils/auth.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: "1 minute",
        errorResponseBuilder: () => ({ message: "Muitas tentativas de login. Tente novamente em 1 minuto." })
      }
    }
  }, async (request, reply) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(request.body);
    const user = await prisma.user.findUnique({ where: { email: body.email }, include: { role: true, client: true } });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return reply.code(401).send({ message: "E-mail ou senha inválidos." });
    }
    const authUser = { id: user.id, email: user.email, role: user.role.name, clientId: user.client?.id };
    return { token: signToken(authUser), user: { id: user.id, name: user.name, email: user.email, role: user.role.name, clientId: user.client?.id } };
  });

  app.get("/auth/me", { preHandler: authenticate }, async (request) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      include: { role: true, client: true }
    });
    return { user: user && { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role.name, client: user.client } };
  });
}
