
import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { CodeEditor } from '@/components/CodeEditor';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { ChatBox } from '@/components/ChatBox';
import { UserPresence } from '@/components/UserPresence';
import { useWebSocket } from '@/lib/websocket';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Document, Message } from '@shared/schema';

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const documentId = parseInt(id);
  const [messages, setMessages] = useState<Message[]>([]);
  const connect = useWebSocket((state) => state.connect);
  const disconnect = useWebSocket((state) => state.disconnect);

  // Query for document
  const { data: document, isLoading: docLoading, error: docError } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`]
  });

  // Query for messages
  const { data: initialMessages, isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: [`/api/documents/${documentId}/messages`],
    enabled: !!documentId,
    onSuccess: (data) => {
      setMessages(data || []);
    }
  });

  useEffect(() => {
    if (!documentId) return;

    // Connect to WebSocket
    connect(documentId, 1);

    // Set up message listener
    const socket = useWebSocket.getState().socket;
    if (socket) {
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'chat' || message.type === 'drawing') {
            setMessages(prev => [...prev, message]);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };
    }

    return () => {
      disconnect();
    };
  }, [documentId, connect, disconnect]);

  if (docLoading || msgsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading document...</p>
      </div>
    );
  }

  if (docError || !document) {
    return (
      <div className="flex items-center justify-center h-screen text-destructive">
        <p>Document not found or error loading</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{document.title || 'Untitled Document'}</h1>
        <UserPresence />
      </div>

      <Card className="flex-1">
        <Tabs defaultValue="code" className="h-full flex flex-col">
          <TabsList>
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="drawing">Drawing</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="flex-1">
            <CodeEditor documentId={documentId} initialContent={document.content} />
          </TabsContent>
          <TabsContent value="drawing" className="flex-1">
            <DrawingCanvas documentId={documentId} messages={messages} />
          </TabsContent>
          <TabsContent value="chat" className="flex-1">
            <ChatBox documentId={documentId} messages={messages} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
