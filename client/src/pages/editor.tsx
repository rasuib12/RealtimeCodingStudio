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

  // Query for document
  const { data: document, isLoading: docLoading, error: docError } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`]
  });

  // Query for messages
  const { isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: [`/api/documents/${documentId}/messages`],
    onSuccess: (messages) => setMessages(messages || [])
  });

  useEffect(() => {
    if (document) {
      // Connect to WebSocket when document is loaded
      connect(documentId, 1); // TODO: Get actual user ID from auth
    }
  }, [document, documentId]);

  // Show loading state
  if (docLoading || msgsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading document...</p>
      </div>
    );
  }

  // Show error state
  if (docError || !document) {
    return (
      <div className="flex items-center justify-center h-screen text-destructive">
        <p>Document not found or error loading</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col gap-4">
      <Card className="p-4">
        <UserPresence users={[{ id: 1, username: "User 1" }]} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="lg:col-span-2 h-full">
          <Card className="h-full">
            <CodeEditor 
              documentId={documentId}
              initialContent={document.content}
            />
          </Card>
        </div>

        <div className="h-full">
          <Tabs defaultValue="chat" className="h-full flex flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="chat" className="flex-1">Chat</TabsTrigger>
              <TabsTrigger value="drawing" className="flex-1">Drawing</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1">
              <ChatBox 
                documentId={documentId}
                messages={messages}
              />
            </TabsContent>

            <TabsContent value="drawing" className="flex-1">
              <Card className="h-full p-4">
                <DrawingCanvas documentId={documentId} />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}