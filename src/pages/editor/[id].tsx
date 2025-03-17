
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { CodeEditor } from '@/components/CodeEditor';
import { DrawingCanvas } from '@/components/DrawingCanvas';
import { ChatBox } from '@/components/ChatBox';
import { UserPresence } from '@/components/UserPresence';
import { useWebSocket } from '@/lib/websocket';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Document, Message } from '@shared/schema';

export default function EditorPage() {
  const router = useRouter();
  const { id } = router.query;
  const documentId = parseInt(id as string);
  const [messages, setMessages] = useState<Message[]>([]);
  const connect = useWebSocket((state) => state.connect);
  const disconnect = useWebSocket((state) => state.disconnect);

  // Query for document
  const { data: document, isLoading: docLoading } = useQuery<Document>({
    queryKey: [`/api/documents/${documentId}`],
    enabled: !!documentId
  });

  // Query for messages
  const { data: initialMessages, isLoading: msgsLoading } = useQuery<Message[]>({
    queryKey: [`/api/documents/${documentId}/messages`],
    enabled: !!documentId
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  if (docLoading || msgsLoading) {
    return <div>Loading...</div>;
  }

  if (!document) {
    return <div>Document not found</div>;
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
