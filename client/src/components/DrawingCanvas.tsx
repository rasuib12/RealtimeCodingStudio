import { useEffect, useRef } from 'react';
import { useWebSocket } from '@/lib/websocket';

interface DrawingCanvasProps {
  documentId: number;
}

export function DrawingCanvas({ documentId }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const sendMessage = useWebSocket((state) => state.sendMessage);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = (e: MouseEvent) => {
      if (!isDrawing.current) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineTo(x, y);
      ctx.stroke();
      
      sendMessage({
        type: 'drawing',
        documentId,
        data: { x, y }
      });
    };

    canvas.addEventListener('mousedown', () => {
      isDrawing.current = true;
      ctx.beginPath();
    });
    
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing.current = false);
    canvas.addEventListener('mouseout', () => isDrawing.current = false);
    
    return () => {
      canvas.removeEventListener('mousedown', () => isDrawing.current = true);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', () => isDrawing.current = false);
      canvas.removeEventListener('mouseout', () => isDrawing.current = false);
    };
  }, [documentId]);

  return (
    <canvas 
      ref={canvasRef}
      className="border border-border rounded-md bg-white"
      width={600}
      height={400}
    />
  );
}
