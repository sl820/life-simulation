'use client';

import { useState, useRef, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  type: 'user' | 'historical' | 'system';
  aboutMe?: string;
}

interface Message {
  id: string;
  type: 'request' | 'response' | 'event';
  from: { agentId: string; agentType: string; name: string };
  content: {
    intent: string;
    payload: { text?: string; topic?: string };
    context: { sceneId: string; simulationId?: string };
  };
  timestamp: string;
}

interface A2AChatProps {
  agent: Agent;
  userName: string;
  userAvatar?: string;
  sceneId?: string;
  onClose?: () => void;
}

export default function A2AChat({ agent, userName, userAvatar, sceneId, onClose }: A2AChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;

    setSending(true);

    try {
      const res = await fetch('/api/a2a/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toAgentId: agent.id,
          conversationId,
          content: {
            intent: 'chat',
            payload: { text, topic: sceneId },
            context: { sceneId: sceneId || 'default' },
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        setConversationId(data.message.conversationId);

        // Add user message
        setMessages((prev) => [
          ...prev,
          {
            id: data.message.id,
            type: 'request',
            from: { agentId: 'user', agentType: 'user', name: userName },
            content: data.message.content,
            timestamp: data.message.timestamp,
          },
        ]);

        // If it's a historical agent, fetch the updated conversation for response
        if (agent.type === 'historical') {
          await fetchMessages(data.message.conversationId);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/a2a/conversations/${convId}`);
      const data = await res.json();
      if (data.conversation) {
        const agentMessages = data.conversation.messages
          .filter((m: Message) => m.from.agentId === agent.id || m.content.payload.text)
          .slice(-10);
        setMessages((prev) => {
          const userMsgId = prev[prev.length - 1]?.id;
          const newMsgs = agentMessages.filter((m: Message) => m.id !== userMsgId);
          return [...prev, ...newMsgs];
        });
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const suggestedQuestions = [
    '你认为什么是幸福？',
    '如何做出重要的人生选择？',
    '你对我有什么建议？',
  ];

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-bold text-white">
            {agent.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
            ) : (
              agent.name.charAt(0)
            )}
          </div>
          <div>
            <div className="font-medium text-zinc-900 dark:text-zinc-100">{agent.name}</div>
            {agent.aboutMe && <div className="text-xs text-zinc-500">{agent.aboutMe}</div>}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: '400px', minHeight: '300px' }}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="text-4xl">💬</div>
            <div>
              <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">开始与 {agent.name} 对话</p>
              <p className="mb-4 text-sm text-zinc-500">你们可以讨论人生、哲学、职业选择等话题</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={sending}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isUser = msg.from.agentType === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
                    }`}
                  >
                    <div className="text-sm">{msg.content.payload.text}</div>
                    <div className={`mt-1 text-xs ${isUser ? 'text-blue-200' : 'text-zinc-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-zinc-200 p-3 dark:border-zinc-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`对 ${agent.name} 说...`}
            disabled={sending}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              '发送'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
