
import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Message } from '@shared/schema';

interface ChatBoxProps {
  documentId: number;
  messages: Message[];
}

export function ChatBox({ documentId, messages }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const sendMessage = useWebSocket((state) => state.sendMessage);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;

    sendMessage({
      type: 'chat',
      documentId,
      content: message.trim()
    });

    setMessage('');
  };

  return (
    <Card className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages && messages.map((msg) => (
            msg.type === 'chat' && (
              <div 
                key={msg.id} 
                className="p-3 rounded-lg bg-muted/50"
              >
                <div className="font-semibold text-sm text-muted-foreground">
                  User {msg.userId}
                </div>
                <div className="mt-1 text-sm">
                  {msg.content}
                </div>
              </div>
            )
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </Card>
  );
}
