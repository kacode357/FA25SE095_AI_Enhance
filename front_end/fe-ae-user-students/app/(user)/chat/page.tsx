"use client";

import { useApp } from "@/components/providers/AppProvider";
import Button from "@/components/ui/Button";
import { useMemo, useState } from "react";

export default function ChatPage() {
  const { threads, messages, sendMessage, ensureThread } = useApp();
  const [activeId, setActiveId] = useState<string>(threads[0]?.id ?? "");
  const [text, setText] = useState("");

  const activeMessages = useMemo(() => messages.filter((m) => m.threadId === activeId), [messages, activeId]);

  const onSend = () => {
    if (!text.trim()) return;
    sendMessage(activeId, text.trim(), "You", "u1");
    setText("");
  };

  const onNewThread = () => {
    const th = ensureThread(`New chat ${threads.length + 1}`, ["u1"]);
    setActiveId(th.id);
  };

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4">
      <aside className="card p-2 h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between px-2 py-1">
          <h2 className="font-semibold">Cuộc trò chuyện</h2>
          <button className="btn btn-outline h-8" onClick={onNewThread}>Tạo mới</button>
        </div>
        {threads.map((t) => (
          <button key={t.id} onClick={() => setActiveId(t.id)} className={`w-full text-left px-3 py-2 rounded-md ${activeId === t.id ? "bg-black text-white" : "hover:bg-black/5"}`}>
            <div className="font-medium truncate">{t.name}</div>
            <div className="text-xs text-black/50">{t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleString() : "-"}</div>
          </button>
        ))}
      </aside>

      <section className="card flex flex-col h-[70vh]">
        <div className="border-b px-4 py-3 font-semibold">Hội thoại</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeMessages.map((m) => (
            <div key={m.id} className="max-w-[75%] rounded-xl px-3 py-2 border">
              <div className="text-xs text-black/50">{m.senderName} • {new Date(m.createdAt).toLocaleTimeString()}</div>
              <div className="text-sm">{m.content}</div>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex items-center gap-2">
          <input className="input flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập tin nhắn..." />
          <Button onClick={onSend}>Gửi</Button>
        </div>
      </section>
    </div>
  );
}
