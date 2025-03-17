import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useWebSocket } from '@/lib/websocket';

interface CodeEditorProps {
  documentId: number;
  initialContent: string;
}

export function CodeEditor({ documentId, initialContent }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const sendMessage = useWebSocket((state) => state.sendMessage);

  useEffect(() => {
    if (editorRef.current) {
      monacoRef.current = monaco.editor.create(editorRef.current, {
        value: initialContent,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
      });

      monacoRef.current.onDidChangeModelContent(() => {
        sendMessage({
          type: 'code',
          documentId,
          content: monacoRef.current?.getValue()
        });
      });
    }

    return () => monacoRef.current?.dispose();
  }, [documentId, initialContent]);

  return <div ref={editorRef} className="h-full w-full" />;
}
