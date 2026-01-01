'use client';

import { useEffect, useState, useRef } from 'react';
import { ChatMessage } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils/format';

interface ChatRoomProps {
  playerId: string;
  username: string;
  lizardLevel: number;
  locationEmoji: string;
  initialMessages: ChatMessage[];
}

export default function ChatRoom({
  playerId,
  username,
  lizardLevel,
  locationEmoji,
  initialMessages,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Subscribe to new messages with Realtime
  useEffect(() => {
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((current) => [...current, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Rate limiting (3 seconds between messages)
    const now = Date.now();
    if (now - lastSent < 3000) {
      alert('Please wait 3 seconds between messages');
      return;
    }

    // Character limit
    if (newMessage.length > 200) {
      alert('Message too long! Max 200 characters.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        player_id: playerId,
        username,
        lizard_level: lizardLevel,
        location_emoji: locationEmoji,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
      setLastSent(now);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-500">No messages yet. Be the first to say hello!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwnMessage = msg.player_id === playerId;

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  isOwnMessage
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">
                    {msg.location_emoji}
                  </span>
                  <span className={`text-xs font-semibold ${isOwnMessage ? 'text-white/90' : 'text-gray-600'}`}>
                    [Lvl {msg.lizard_level}] {msg.username}
                  </span>
                </div>

                {/* Message */}
                <div className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
                  {msg.message}
                </div>

                {/* Timestamp */}
                <div className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                  {formatRelativeTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent"
            maxLength={200}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
          >
            {loading ? '...' : 'Send'}
          </button>
        </form>
        <div className="text-xs text-gray-500 mt-2 text-center">
          {newMessage.length}/200 characters
        </div>
      </div>
    </div>
  );
}
