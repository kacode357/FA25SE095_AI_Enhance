"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, Conversation } from "@/types/messager.type";
import { Bot, Loader2, Pencil, Plus, RotateCcw, Send, Trash2, User2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function MessengerPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'c1',
      title: 'Question about project requirements',
      updatedAt: '5m ago',
      messages: [
        { id: 'm1', role: 'user', content: 'Teacher, what sections are required in the report?', createdAt: '5m ago' },
        { id: 'm2', role: 'assistant', content: 'The report should include: Introduction, Requirements Analysis, Design (use case, ERD), Implementation, Testing, Conclusion & Future Work.', createdAt: '4m ago' },
      ],
    },
    {
      id: 'c2',
      title: 'Group 1 Chat',
      updatedAt: '1h ago',
      messages: [
        { id: 'm1', role: 'assistant', content: 'Has the group submitted the new version?', createdAt: '1h ago' },
        { id: 'm2', role: 'user', content: 'We are finishing the test part, will submit this afternoon.', createdAt: '1h ago' },
      ],
    },
  ]);
  const [activeId, setActiveId] = useState('c1');
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeConv = conversations.find(c => c.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv.messages.length]);

  const handleSend = () => {
    if (isSending) return; // guard
    const trimmed = input.trim();
    if (!trimmed) return;
    setIsSending(true);
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed, createdAt: new Date().toISOString() };
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, userMsg], updatedAt: 'now' } : c));
    setInput('');
    setTimeout(() => {
      const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: 'Your question has been received. (Sample UI)', createdAt: new Date().toISOString() };
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, assistantMsg], updatedAt: 'now' } : c));
      setIsSending(false);
    }, 900);
  };

  const handleNewConversation = () => {
    if (isSending) return; // avoid switching mid-send
    const id = crypto.randomUUID();
    const newConv: Conversation = { id, title: 'New conversation', updatedAt: 'now', messages: [] };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(id);
    setDraft('');
  };

  const applyDraftToConversation = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      if (c.messages.length === 0) {
        return { ...c, messages: [{ id: crypto.randomUUID(), role: 'assistant', content: trimmed, createdAt: new Date().toISOString() }], updatedAt: 'now' };
      }
      const last = c.messages[c.messages.length - 1];
      if (last.role === 'assistant') {
        return { ...c, messages: [...c.messages.slice(0, -1), { ...last, content: trimmed }], updatedAt: 'now' };
      }
      return { ...c, messages: [...c.messages, { id: crypto.randomUUID(), role: 'assistant', content: trimmed, createdAt: new Date().toISOString() }], updatedAt: 'now' };
    }));
  };

  return (
    <div className='min-h-full flex flex-col p-2 bg-white text-slate-900'>
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Chat with students / groups.
          </p>
          <Button onClick={handleNewConversation} className='h-9 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white'><Plus className='size-4'/>New conversation</Button>
        </div>
      </header>

      <div className='flex-1 grid xl:grid-cols-3 gap-4 min-h-[600px]'>
        {/* Conversations list */}
        <div className='border border-slate-200 rounded-lg bg-white flex flex-col overflow-hidden'>
          <div className='px-4 py-3 border-b bg-slate-50 flex items-center justify-between'>
            <h4 className='text-sm font-semibold text-slate-700'>Conversations</h4>
            <span className='text-[10px] font-medium uppercase text-slate-500'>{conversations.length} sessions</span>
          </div>
          <div className='flex-1 overflow-auto divide-y divide-slate-100'>
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => { setActiveId(conv.id); setDraft(''); }}
                className={`w-full text-left px-4 py-3 group transition flex flex-col gap-1 ${activeId===conv.id ? 'bg-emerald-50 border-l-emerald-500' : 'hover:bg-slate-50'}`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-semibold text-slate-700 line-clamp-1'>{conv.title}</span>
                </div>
                <span className='text-[10px] text-slate-500'>{conv.updatedAt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat + Composer */}
        <div className='border border-slate-200 rounded-lg bg-white flex flex-col overflow-hidden xl:col-span-2'>
          <div className='flex-1 flex overflow-hidden'>
            {/* Chat area */}
            <div className='flex-1 flex flex-col border-r border-slate-200'>
              <div className='px-4 py-3 border-b bg-slate-50 flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-slate-700 line-clamp-1'>{activeConv.title}</h4>
                <div className='flex items-center gap-2'>
                  <Button variant='ghost' className='h-7 px-2 text-[11px] flex items-center gap-1'><RotateCcw className='size-3.5'/>History</Button>
                  <Button variant='ghost' className='h-7 px-2 text-[11px] flex items-center gap-1'><Trash2 className='size-3.5'/>Delete</Button>
                </div>
              </div>
              <div className='flex-1 overflow-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white'>
                {activeConv.messages.length === 0 && (
                  <div className='text-center text-xs text-slate-400 pt-20'>No messages yet. Start the conversation...</div>
                )}
                {activeConv.messages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'assistant' ? 'flex-row-reverse text-right' : ''}`}>
                    <div className={`size-8 rounded-md flex items-center justify-center shadow-sm ${msg.role === 'assistant' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {msg.role === 'assistant' ? <Bot className='size-4'/> : <User2 className='size-4'/>}
                    </div>
                    <div className={`rounded-lg px-3 py-2 text-xs max-w-[70%] leading-relaxed whitespace-pre-wrap border ${msg.role === 'assistant' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-200 text-slate-700'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className='flex items-start gap-3'>
                    <div className='size-8 rounded-md flex items-center justify-center shadow-sm bg-slate-200 text-slate-600'>
                      <Bot className='size-4'/>
                    </div>
                    <div className='rounded-lg px-3 py-2 text-xs border bg-white border-slate-200 text-slate-400 flex items-center gap-2'>
                      <Loader2 className='size-3 animate-spin'/> Composing reply...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className='border-t border-slate-200 p-3 space-y-2'>
                <div className='flex items-center gap-2'>
                  <Input
                    placeholder='Type a message...'
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className='h-9 text-xs'
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  />
                  <Button disabled={isSending || !input.trim()} onClick={handleSend} className='h-9 flex items-center gap-1 text-xs'>
                    {isSending ? <Loader2 className='size-4 animate-spin'/> : <Send className='size-4'/>}
                    Gửi
                  </Button>
                </div>
                <p className='text-[10px] text-slate-400'>Press Enter to send, Shift + Enter for newline. (Sample UI)</p>
              </div>
            </div>

            {/* Draft / Manual editor */}
            <div className='w-80 hidden lg:flex flex-col bg-slate-50'>
              <div className='px-4 py-3 border-b border-slate-200 flex items-center justify-between'>
                <h4 className='text-[13px] font-semibold text-slate-700 flex items-center gap-1'><Pencil className='size-4'/>Notes / Drafting</h4>
                <Button variant='ghost' className='h-7 px-2 text-[11px]' onClick={applyDraftToConversation}>Apply</Button>
              </div>
              <div className='p-3 flex-1 flex flex-col'>
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder='Draft a sample answer or internal notes...'
                  className='flex-1 resize-none text-[11px] rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 p-2 bg-white'
                />
                <div className='mt-2 flex justify-end'>
                  <Button className='h-7 px-3 text-[11px]' onClick={applyDraftToConversation}>Apply</Button>
                </div>
                <div className='mt-3 text-[10px] text-slate-400 leading-relaxed'>
                  This panel simulates a parallel editor to refine a response before sending it into the conversation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
