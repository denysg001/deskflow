"use client";

import { Bell, Check, ExternalLink, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, getUser, type SessionUser } from "@/lib/api";
import type { Notification } from "@/types/domain";
import { Button } from "./ui/button";

export function NotificationCenter() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const enabled = user?.role === "ADMIN" || user?.role === "OPERATOR";

  useEffect(() => {
    setUser(getUser());
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!enabled) return;
    const data = await api<{ items: Notification[]; unreadCount: number }>("/notifications?limit=8");
    const unreadItems = data.items.filter((item) => !item.readAt);
    const newItems = unreadItems.filter((item) => !knownIds.current.has(item.id));
    if (initialized.current && newItems.length) setToast(newItems[0]);
    data.items.forEach((item) => knownIds.current.add(item.id));
    initialized.current = true;
    setItems(data.items);
    setUnreadCount(data.unreadCount);
  }, [enabled]);

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 10000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  async function markAsRead(id: string) {
    await api(`/notifications/${id}/read`, { method: "PATCH" });
    await loadNotifications();
  }

  async function openTicket(notification: Notification) {
    await markAsRead(notification.id);
    router.push(`/tickets/${notification.ticket.id}`);
    setToast(null);
    setOpen(false);
  }

  if (!enabled) return null;

  return (
    <div className="relative">
      <Button variant="ghost" className="relative text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setOpen(!open)} title="Notificações">
        <Bell size={18} />
        {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-black text-white">{unreadCount}</span>}
      </Button>

      {open && (
        <div className="absolute bottom-12 left-0 z-40 w-80 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <p className="font-black">Notificações</p>
              <p className="text-xs text-slate-400">{unreadCount} não lidas</p>
            </div>
            <MessageSquare className="text-primary" size={18} />
          </div>
          <div className="max-h-96 overflow-auto">
            {items.map((item) => (
              <div key={item.id} className="border-b border-white/10 p-4 last:border-b-0">
                <button className="block w-full text-left" onClick={() => openTicket(item)}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-black">{item.ticket.protocol}</span>
                    {!item.readAt && <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">Nova</span>}
                  </div>
                  <p className="text-sm text-slate-200">{item.ticket.client.name}</p>
                  <p className="line-clamp-2 text-xs text-slate-400">{item.messagePreview}</p>
                  <p className="mt-2 text-[10px] text-slate-500">{new Date(item.createdAt).toLocaleString("pt-BR")}</p>
                </button>
                <div className="mt-3 flex gap-2">
                  <Button className="h-8 px-3 text-xs" variant="secondary" onClick={() => openTicket(item)}><ExternalLink className="mr-1" size={13} /> Abrir</Button>
                  {!item.readAt && <Button className="h-8 px-3 text-xs" variant="ghost" onClick={() => markAsRead(item.id)}><Check className="mr-1" size={13} /> Lida</Button>}
                </div>
              </div>
            ))}
            {!items.length && <div className="p-6 text-center text-sm text-slate-400">Nenhuma notificação por enquanto.</div>}
          </div>
          <Link href="/tickets?hasUnreadClientInteraction=true" className="block border-t border-white/10 p-3 text-center text-sm font-bold text-primary" onClick={() => setOpen(false)}>
            Ver interações não lidas
          </Link>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-4 z-50 w-[min(380px,calc(100vw-2rem))] rounded-2xl border bg-slate-950 p-4 text-white shadow-2xl">
          <p className="text-sm font-black">Nova interação do cliente no chamado {toast.ticket.protocol}</p>
          <p className="mt-1 text-sm text-slate-300">{toast.ticket.client.name}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{toast.messagePreview}</p>
          <p className="mt-2 text-xs text-slate-500">{new Date(toast.createdAt).toLocaleString("pt-BR")}</p>
          <div className="mt-3 flex gap-2">
            <Button className="h-9" onClick={() => openTicket(toast)}>Abrir chamado</Button>
            <Button className="h-9" variant="ghost" onClick={() => setToast(null)}>Fechar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
