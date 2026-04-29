import { PrismaClient, RoleName, TicketStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 60 * 60 * 1000);
const past = (days: number, hours = 0) => new Date(Date.now() - days * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000);

async function main() {
  const [adminRole, operatorRole, clientRole] = await Promise.all(
    [RoleName.ADMIN, RoleName.OPERATOR, RoleName.CLIENT].map((name) =>
      prisma.role.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const [admin, operator, clientUser] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@cowork.local" },
      update: {},
      create: { name: "Admin DeskFlow", email: "admin@cowork.local", passwordHash: await bcrypt.hash("Admin@123", 10), roleId: adminRole.id, phone: "(11) 90000-0001" }
    }),
    prisma.user.upsert({
      where: { email: "operador@cowork.local" },
      update: {},
      create: { name: "Operador Técnico", email: "operador@cowork.local", passwordHash: await bcrypt.hash("Operador@123", 10), roleId: operatorRole.id, phone: "(11) 90000-0002" }
    }),
    prisma.user.upsert({
      where: { email: "cliente@cowork.local" },
      update: {},
      create: { name: "Cliente Coworking", email: "cliente@cowork.local", passwordHash: await bcrypt.hash("Cliente@123", 10), roleId: clientRole.id, phone: "(11) 90000-0003" }
    })
  ]);

  const client = await prisma.client.upsert({
    where: { email: "cliente@cowork.local" },
    update: { userId: clientUser.id },
    create: { name: "Cliente Coworking", company: "Startup Aurora", document: "12.345.678/0001-90", email: "cliente@cowork.local", phone: "(11) 90000-0003", userId: clientUser.id }
  });

  const otherClient = await prisma.client.upsert({
    where: { email: "financeiro@orbit.local" },
    update: {},
    create: { name: "Marina Costa", company: "Orbit Labs", email: "financeiro@orbit.local", phone: "(11) 91111-2222" }
  });

  await Promise.all([
    prisma.supplier.upsert({ where: { id: "supplier-network" }, update: {}, create: { id: "supplier-network", name: "NetPrime Serviços", email: "suporte@netprime.local", phone: "(11) 3333-0101", service: "Internet e infraestrutura" } }),
    prisma.supplier.upsert({ where: { id: "supplier-facilities" }, update: {}, create: { id: "supplier-facilities", name: "Facility Pro", email: "contato@facilitypro.local", phone: "(11) 3333-0202", service: "Manutenção predial" } }),
    prisma.supplier.upsert({ where: { id: "supplier-clean" }, update: {}, create: { id: "supplier-clean", name: "CleanOffice", email: "ops@cleanoffice.local", phone: "(11) 3333-0303", service: "Limpeza" } })
  ]);

  const categories = await Promise.all([
    "Internet / Wi-Fi", "Impressão", "Banheiro", "Limpeza", "Iluminação", "Ar-condicionado", "Sala de reunião", "Controle de acesso", "Mobiliário", "Elétrica", "Manutenção geral"
  ].map((name) => prisma.category.upsert({ where: { name }, update: {}, create: { name, description: `Solicitações de ${name.toLowerCase()}` } })));

  const requestTypes = await Promise.all([
    "Manutenção", "Implantação", "Suporte", "Substituição", "Limpeza", "Vistoria", "Melhoria", "Emergência"
  ].map((name) => prisma.requestType.upsert({ where: { name }, update: {}, create: { name } })));

  const priorities = await Promise.all([
    { name: "LOW", label: "Baixa", slaHours: 48, color: "emerald" },
    { name: "MEDIUM", label: "Média", slaHours: 24, color: "sky" },
    { name: "HIGH", label: "Alta", slaHours: 8, color: "amber" },
    { name: "CRITICAL", label: "Crítica", slaHours: 2, color: "rose" }
  ].map((priority) => prisma.priority.upsert({ where: { name: priority.name }, update: priority, create: priority })));

  const locations = await Promise.all([
    "Recepção", "Sala 01", "Sala 02", "Sala de reunião", "Banheiro masculino", "Banheiro feminino", "Copa", "Área compartilhada", "Área externa", "Impressoras"
  ].map((name) => prisma.location.upsert({ where: { name }, update: {}, create: { name, floor: name.includes("Sala") ? "1º andar" : "Térreo" } })));

  const samples = [
    ["Internet não funciona", "A conexão caiu nos postos próximos à janela.", "Internet / Wi-Fi", "Suporte", "HIGH", "Área compartilhada", TicketStatus.IN_PROGRESS, client.id, -2],
    ["Wi-Fi instável", "A rede desconecta durante chamadas de vídeo.", "Internet / Wi-Fi", "Suporte", "MEDIUM", "Sala 01", TicketStatus.OPEN, client.id, 0],
    ["Impressora sem papel", "A impressora principal está sem papel A4.", "Impressão", "Substituição", "LOW", "Impressoras", TicketStatus.RESOLVED, otherClient.id, -1],
    ["Impressora não imprime", "Arquivos ficam presos na fila de impressão.", "Impressão", "Manutenção", "MEDIUM", "Impressoras", TicketStatus.WAITING_SUPPLIER, client.id, -3],
    ["Banheiro sem papel higiênico", "Reposição necessária no banheiro masculino.", "Banheiro", "Limpeza", "HIGH", "Banheiro masculino", TicketStatus.CLOSED, otherClient.id, -4],
    ["Lâmpada queimada", "Lâmpada piscando na sala de reunião.", "Iluminação", "Manutenção", "LOW", "Sala de reunião", TicketStatus.OPEN, client.id, -3],
    ["Ar-condicionado não gela", "Temperatura alta mesmo em 18 graus.", "Ar-condicionado", "Manutenção", "CRITICAL", "Sala 02", TicketStatus.OPEN, client.id, -1],
    ["Problema em equipamento da sala de reunião", "Cabo HDMI sem sinal no monitor.", "Sala de reunião", "Suporte", "MEDIUM", "Sala de reunião", TicketStatus.IN_PROGRESS, otherClient.id, -2],
    ["Problema na porta ou controle de acesso", "Leitor facial não libera entrada.", "Controle de acesso", "Manutenção", "CRITICAL", "Recepção", TicketStatus.WAITING_SUPPLIER, client.id, -1],
    ["Solicitação de limpeza", "Café derramado na área compartilhada.", "Limpeza", "Limpeza", "MEDIUM", "Área compartilhada", TicketStatus.RESOLVED, client.id, 0],
    ["Cadeira ou mesa quebrada", "Cadeira da estação 14 com apoio solto.", "Mobiliário", "Substituição", "LOW", "Área compartilhada", TicketStatus.OPEN, otherClient.id, -5],
    ["Tomada sem energia", "Tomadas da bancada central sem energia.", "Elétrica", "Emergência", "HIGH", "Copa", TicketStatus.CANCELED, client.id, -7]
  ] as const;

  for (let index = 0; index < samples.length; index += 1) {
    const [title, description, categoryName, requestTypeName, priorityName, locationName, status, clientId, dayOffset] = samples[index];
    const priority = priorities.find((item) => item.name === priorityName)!;
    const createdAt = dayOffset < 0 ? past(Math.abs(dayOffset), index) : new Date();
    const protocol = `DF-${String(index + 1).padStart(6, "0")}`;
    const ticket = await prisma.ticket.upsert({
      where: { protocol },
      update: {},
      create: {
        protocol,
        title,
        description,
        status,
        clientId,
        categoryId: categories.find((item) => item.name === categoryName)!.id,
        requestTypeId: requestTypes.find((item) => item.name === requestTypeName)!.id,
        priorityId: priority.id,
        locationId: locations.find((item) => item.name === locationName)!.id,
        assignedOperatorId: index % 2 === 0 ? operator.id : null,
        slaDueAt: addHours(createdAt, priority.slaHours),
        resolvedAt: status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED ? addHours(createdAt, 4) : null,
        createdAt
      }
    });
    await prisma.ticketComment.upsert({
      where: { id: `comment-${protocol}` },
      update: {},
      create: { id: `comment-${protocol}`, ticketId: ticket.id, authorId: clientUser.id, message: "Chamado registrado pelo portal do cliente.", createdAt }
    });
    await prisma.ticketStatusHistory.upsert({
      where: { id: `history-${protocol}` },
      update: {},
      create: { id: `history-${protocol}`, ticketId: ticket.id, fromStatus: null, toStatus: status, changedBy: admin.id, note: "Status inicial do seed.", createdAt }
    });
  }

  await prisma.auditLog.create({ data: { userId: admin.id, action: "SEED_COMPLETED", entity: "SYSTEM", metadata: { project: "DeskFlow" } } });
}

main().finally(async () => prisma.$disconnect());
