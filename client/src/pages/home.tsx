import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import type { Document } from '@shared/schema';

export default function Home() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState('');

  const createDocument = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/documents', {
        title,
        content: '// Start coding here',
        ownerId: 1 // TODO: Get actual user ID from auth
      });
      return res.json() as Promise<Document>;
    },
    onSuccess: (doc) => {
      navigate(`/editor/${doc.id}`);
    }
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    createDocument.mutate();
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Document</CardTitle>
          <CardDescription>
            Start a new collaborative coding session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button 
              onClick={handleCreate}
              disabled={createDocument.isPending || !title.trim()}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
