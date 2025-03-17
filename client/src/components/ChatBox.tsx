import { useState } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatBoxProps {
  documentId: number;
  messages: Array<{
    id: number;
    content: string;
    userId: number;
  }>;
}

export function ChatBox({ documentId, messages }: ChatBoxProps) {
  const [message, setMessage] = useState('');
  const sendMessage = useWebSocket((state) => state.sendMessage);

  const handleSend = () => {
    if (!message.trim()) return;
    
    sendMessage({
      type: 'chat',
      documentId,
      content: message
    });
    
    setMessage('');
  };

  return (
    <Card className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <span className="font-bold">User {msg.userId}:</span> {msg.content}
          </div>
        ))}
      </ScrollArea>
      
      <div className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </Card>
  );
}
