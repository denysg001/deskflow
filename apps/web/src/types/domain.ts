export type Catalog = {
  categories: Array<{ id: string; name: string }>;
  requestTypes: Array<{ id: string; name: string }>;
  priorities: Array<{ id: string; name: string; label: string; slaHours: number; color: string }>;
  locations: Array<{ id: string; name: string }>;
  operators: Array<{ id: string; name: string; email: string }>;
  suppliers: Array<{ id: string; name: string; service: string }>;
  clients: Array<{ id: string; name: string; email: string; company?: string }>;
};

export type Ticket = {
  id: string;
  protocol: string;
  title: string;
  description: string;
  status: string;
  slaDueAt: string;
  createdAt: string;
  resolvedAt?: string;
  client: { id: string; name: string; company?: string };
  category: { id: string; name: string };
  requestType: { id: string; name: string };
  priority: { id: string; label: string; color: string };
  location: { id: string; name: string };
  assignedOperator?: { id: string; name: string } | null;
  supplier?: { id: string; name: string; service: string } | null;
  comments: Array<{ id: string; message: string; createdAt: string; author: { name: string; role?: { name: "ADMIN" | "OPERATOR" | "CLIENT" } } }>;
  internalNotes: Array<{ id: string; message: string; createdAt: string; author: { name: string } }>;
  attachments: Array<{ id: string; fileName: string; fileUrl: string }>;
  statusHistory: Array<{ id: string; fromStatus?: string | null; toStatus: string; note?: string | null; createdAt: string }>;
  unreadClientInteractionCount?: number;
};

export type Notification = {
  id: string;
  title: string;
  messagePreview: string;
  readAt?: string | null;
  createdAt: string;
  ticket: {
    id: string;
    protocol: string;
    client: { name: string };
  };
};
