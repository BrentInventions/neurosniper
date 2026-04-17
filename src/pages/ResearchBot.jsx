import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Loader2, Copy, CheckCircle2, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const SUGGESTED = [
  'What WebSocket endpoint does Pump.fun use for real-time tokens?',
  'What does a new token creation event payload look like from PumpPortal?',
  'How do I subscribe to trade events for a specific token?',
  'How do I calculate real-time price from bonding curve reserves?',
  'Show me the full React useEffect to connect to PumpPortal WebSocket',
];

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {message.content && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              isUser
                ? 'bg-primary/10 border border-primary/20 text-foreground font-mono'
                : 'bg-card border border-border'
            }`}
          >
            {isUser ? (
              <p>{message.content}</p>
            ) : (
              <ReactMarkdown
                className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  code: ({ inline, children, ...props }) =>
                    inline ? (
                      <code className="px-1 py-0.5 rounded bg-secondary text-primary text-[11px] font-mono">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-secondary rounded-lg p-3 overflow-x-auto my-2 border border-border">
                        <code className="text-[11px] font-mono text-foreground">{children}</code>
                      </pre>
                    ),
                  a: ({ children, href }) => (
                    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
                      {children}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ),
                  p: ({ children }) => <p className="my-1.5 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1 text-foreground">{children}</h3>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mt-4 mb-1.5 text-foreground">{children}</h2>,
                  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {/* Streaming indicator */}
        {message.isStreaming && (
          <div className="flex items-center gap-2 px-4 py-2 mt-1">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            <span className="text-xs font-mono text-muted-foreground">Researching...</span>
          </div>
        )}
        {!isUser && message.content && !message.isStreaming && (
          <button
            onClick={copyAll}
            className="mt-1 ml-1 flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            {copied ? <CheckCircle2 className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            {copied ? 'copied' : 'copy'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ResearchBot() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Create conversation on mount
  useEffect(() => {
    (async () => {
      const conv = await base44.agents.createConversation({
        agent_name: 'pump_researcher',
        metadata: { name: 'Pump.fun API Research' },
      });
      setConversation(conv);
    })();
  }, []);

  // Subscribe to updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || !conversation || sending) return;
    setInput('');
    setSending(true);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: msg });
    } catch (e) {
      toast.error('Failed to send message');
    }
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col max-w-4xl mx-auto p-4 gap-4">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Pump.fun Research Bot</span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-primary/10 text-primary rounded border border-primary/20">
              AI
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Researches WebSocket APIs, event payloads, and integration patterns for real-time token data
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
          <Zap className="w-3 h-3 text-primary" />
          Web search enabled
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-muted-foreground text-sm mb-1">Ask anything about Pump.fun's real-time data APIs</div>
              <div className="text-xs text-muted-foreground">The bot will search the web for the latest docs and examples</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left px-3 py-2.5 rounded-md bg-card border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-xs text-muted-foreground hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-card border border-border">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">Searching web & analyzing...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 flex-shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about Pump.fun WebSocket APIs, event payloads, integration code..."
          className="font-mono bg-secondary border-border"
          disabled={!conversation || sending}
        />
        <Button
          onClick={() => send()}
          disabled={!input.trim() || !conversation || sending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 flex-shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}